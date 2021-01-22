import { MidiLoader } from "./MidiLoader.js"
import { Song } from "./Song.js"
import { CONST } from "./CONST.js"
import { MidiInputHandler } from "./MidiInputHandler.js"
import { AudioPlayer } from "./AudioPlayer.js"
const LOOK_AHEAD_TIME = 0.2
const LOOK_AHEAD_TIME_WHEN_PLAYALONG = 0.02
export class Player {
	constructor() {
		this.sources = []
		this.tracks = {}
		this.audioPlayer = new AudioPlayer(this.tracks, this.settings)

		this.midiInputHandler = new MidiInputHandler()
		this.midiInputHandler.setNoteOnCallback(this.addInputNoteOn.bind(this))
		this.midiInputHandler.setNoteOffCallback(this.addInputNoteOff.bind(this))
		this.startDelay = -2
		this.lastTime = this.audioPlayer.getContextTime()
		this.progress = 0
		this.paused = true
		this.playing = false
		this.scrolling = 0
		this.loadedSongs = new Set()
		this.muted = false
		this.volume = 100
		this.mutedAtVolume = 100

		this.newSongCallbacks = []
		this.inputActiveNotes = {}
		this.onloadStartCallbacks = []
		this.onloadStopCallbacks = []

		this.playbackSpeed = 1
	}
	updateSettings(settings) {
		this.settings = settings
		this.audioPlayer.settings = this.settings
	}
	getState() {
		let time = this.getTime()
		return {
			time: time,
			end: this.song ? this.song.getEnd() : 0,
			loading: this.audioPlayer.loading,
			song: this.song,
			tracks: this.tracks,
			inputActiveNotes: this.inputActiveNotes,
			bpm: this.getBPM(time)
		}
	}
	addNewSongCallback(callback) {
		this.newSongCallbacks.push(callback)
	}
	switchSoundfont(soundfontName, setLoadMessage) {
		this.wasPaused = this.paused
		this.paused = true
		this.onloadStartCallbacks.forEach(callback => callback())
		let nowTime = window.performance.now()
		this.soundfontName = soundfontName
		this.audioPlayer
			.switchSoundfont(soundfontName, this.currentSong, setLoadMessage)
			.then(resolve => {
				window.setTimeout(() => {
					this.paused = this.wasPaused
					this.onloadStopCallbacks.forEach(callback => callback())
				}, Math.max(0, 500 - (window.performance.now() - nowTime)))
			})
	}

	getTimeWithScrollOffset(scrollOffset) {
		return this.progress + this.startDelay - scrollOffset
	}
	getTime() {
		return this.progress + this.startDelay - this.scrollOffset
	}
	getTimeWithoutScrollOffset() {
		return this.progress + this.startDelay
	}
	setTime(seconds) {
		this.sources.forEach(source => source.stop(0))
		this.progress += seconds - this.getTime()
		this.resetNoteSequence()
	}
	getSong() {
		return this.song
	}
	getChannel(track) {
		if (this.song.activeTracks[track].notes.length) {
			return this.channels[this.song.activeTracks[track].notes[0].channel]
		}
	}
	getTrackCurrentInstrument(trackIndex) {
		let i = 0
		let noteSeq = this.currentSong.getNoteSequence()
		let nextNote = noteSeq[i]
		while (nextNote.track != trackIndex && i < noteSeq.length - 1) {
			i++
			nextNote = noteSeq[i]
		}
		if (nextNote.track == trackIndex) {
			return nextNote.instrument
		}
	}
	setupTracks() {
		this.tracks = {}
		for (let t in this.song.activeTracks) {
			if (!this.tracks.hasOwnProperty(t)) {
				this.tracks[t] = {
					draw: true,
					color: CONST.TRACK_COLORS[t % 4],
					volume: 100,
					name: this.song.activeTracks[t].name || "Track " + t,
					requiredToPlay: false,
					index: t
				}
			}
			this.tracks[t].color = CONST.TRACK_COLORS[t % 4]
		}
		this.audioPlayer.tracks = this.tracks
	}

	async loadSong(theSong, fileName, setLoadMessage) {
		setLoadMessage("Loading " + fileName + ".")
		if (this.audioPlayer.isRunning()) {
			this.audioPlayer.suspend()
		}

		this.onloadStartCallbacks.forEach(callback => callback())

		this.loading = true

		setLoadMessage("Parsing Midi File.")
		let midiFile = await MidiLoader.loadFile(theSong)
		this.currentSong = new Song(midiFile, fileName)
		setLoadMessage("Loading Instruments")

		this.setSong(this.currentSong)
		this.loadedSongs.add(this.currentSong)

		await this.audioPlayer.loadInstrumentsForSong(this.currentSong)

		this.setupTracks()
		this.newSongCallbacks.forEach(callback => callback())
		setLoadMessage("Creating Buffers")
		let onloadStopCallbacks = this.onloadStopCallbacks
		return this.audioPlayer
			.loadBuffers()
			.then(v => onloadStopCallbacks.forEach(callback => callback()))
	}

	setSong(song) {
		this.pause()
		this.playing = false
		this.paused = true
		this.wasPaused = true
		this.progress = 0
		this.scrollOffset = 0
		this.song = song
	}
	startPlay() {
		if (!this.song) return false

		console.log("Starting Song")
		this.paused = false
		this.wasPaused = false
		this.playing = true
		this.resetNoteSequence()
		this.lastTime = this.audioPlayer.getContextTime()
		this.audioPlayer.resume()
		this.play()
		return true
	}
	handleScroll(stacksize) {
		if (this.scrolling != 0) {
			if (!this.song) {
				this.scrolling = 0
				return
			}
			this.lastTime = this.audioPlayer.getContextTime()
			let newScrollOffset = this.scrollOffset + 0.01 * this.scrolling
			//get hypothetical time with new scrollOffset.
			let oldTime = this.getTimeWithScrollOffset(this.scrollOffset)
			let newTime = this.getTimeWithScrollOffset(newScrollOffset)

			//limit scroll past end
			if (this.getSong() && newTime > 1 + this.getSong().getEnd() / 1000) {
				this.scrolling = 0
				newScrollOffset =
					this.getTimeWithoutScrollOffset() -
					(1 + this.getSong().getEnd() / 1000)
				this.scrollOffset +
					(1 + this.getSong().getEnd() / 1000 - this.getTime()) ||
					this.scrollOffset
			}

			//limit scroll past beginning
			if (newTime < oldTime && newTime < this.startDelay) {
				this.scrolling = 0
				newScrollOffset = this.getTimeWithoutScrollOffset() - this.startDelay
			}

			this.scrollOffset = newScrollOffset

			//dampen scroll amount somehow...
			this.scrolling =
				(Math.abs(this.scrolling) -
					Math.max(
						Math.abs(this.scrolling * 0.003),
						this.playbackSpeed * 0.001
					)) *
					(Math.abs(this.scrolling) / this.scrolling) || 0

			//set to zero if only minimal scrollingspeed left
			if (Math.abs(this.scrolling) <= this.playbackSpeed * 0.005) {
				this.scrolling = 0
				this.resetNoteSequence()
			}
			//limit recursion
			if (!stacksize) stacksize = 0
			if (stacksize > 50) {
				window.setTimeout(() => {
					this.handleScroll()
				}, 25)
				return
			}
			this.handleScroll(++stacksize)
			return
		}
	}
	getBPM(time) {
		let val = 0
		if (this.song) {
			for (let i = this.song.temporalData.bpms.length - 1; i >= 0; i--) {
				if (time * 1000 > this.song.temporalData.bpms[i].timestamp) {
					val = this.song.temporalData.bpms[i].bpm
					break
				}
			}
		}
		return val
	}
	play() {
		if (this.scrolling != 0) {
		}
		let currentContextTime = this.audioPlayer.getContextTime()

		let delta = (currentContextTime - this.lastTime) * this.playbackSpeed
		//cap max framerate.
		if (delta < 0.0069) {
			window.requestAnimationFrame(this.play.bind(this))
			return
		}
		let oldProgress = this.progress
		this.lastTime = currentContextTime
		if (!this.paused) {
			this.progress += delta
		} else {
			window.setTimeout(this.play.bind(this), 20)
			return
		}

		let currentTime = this.getTime()

		if (this.isSongEnded(currentTime - 0.5)) {
			this.pause()
			return
		}

		while (this.isNextNoteReached(currentTime)) {
			let toRemove = 0
			forLoop: for (let i = 0; i < this.noteSequence.length; i++) {
				if (currentTime > 0.05 + this.noteSequence[i].timestamp / 1000) {
					toRemove++
				} else {
					break forLoop
				}
			}
			if (toRemove > 0) {
				this.noteSequence.splice(0, toRemove)
			}

			if (
				!this.tracks[this.noteSequence[0].track].requiredToPlay ||
				this.isInputKeyPressed(this.noteSequence[0].noteNumber)
			) {
				this.playNote(this.noteSequence.shift())
			} else {
				this.progress = oldProgress
				break
			}
		}

		// if (!this.paused) {
		window.requestAnimationFrame(this.play.bind(this))
		// }
	}
	// setChannelVolumes(currentTime) {
	// 	let currentSecond = Math.floor(currentTime)
	// 	for (let i = 0; i < currentSecond; i++) {
	// 		if (!this.song.controlEvents.hasOwnProperty(i)) continue

	// 		for (let c in this.song.controlEvents[i]) {
	// 			let controlEvent = this.song.controlEvents[i][c]
	// 			if (controlEvent.timestamp <= currentTime) {
	// 				if (controlEvent.controllerType == 7) {
	// 					this.channels[controlEvent.channel].volume = controlEvent.value
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	isInputKeyPressed(noteNumber) {
		if (
			this.inputActiveNotes.hasOwnProperty(noteNumber) &&
			!this.inputActiveNotes[noteNumber].wasUsed
		) {
			this.inputActiveNotes[noteNumber].wasUsed = true
			return true
		}
		return false
	}
	isSongEnded(currentTime) {
		return currentTime >= this.song.getEnd() / 1000
	}

	isNextNoteReached(currentTime) {
		let lookahead = this.isPlayalong()
			? LOOK_AHEAD_TIME_WHEN_PLAYALONG
			: LOOK_AHEAD_TIME
		return (
			this.noteSequence.length &&
			this.noteSequence[0].timestamp / 1000 <
				currentTime + lookahead * this.playbackSpeed
		)
	}
	isPlayalong() {
		return (
			Object.keys(this.tracks)
				.slice(0)
				.filter(track => this.tracks[track].requiredToPlay).length > 0
		)
	}
	isPlaying() {
		return this.playing
	}
	stop() {
		this.progress = 0
		this.scrollOffset = 0
		this.playing = false
		this.pause()
	}
	resume() {
		if (!this.song) return
		console.log("Resuming Song")
		this.paused = false
		this.wasPaused = false
		this.resetNoteSequence()
		this.audioPlayer.resume()
		this.play()
	}
	resetNoteSequence() {
		this.noteSequence = this.song.getNoteSequence()
		this.noteSequence = this.noteSequence.filter(
			note => note.timestamp > this.getTime()
		)
		this.inputActiveNotes = {}
	}

	pause() {
		console.log("Pausing Song")
		this.pauseTime = this.getTime()
		this.paused = true
		this.wasPaused = true
	}

	playNote(note) {
		if (!note.hasOwnProperty("channel") || !note.hasOwnProperty("noteNumber")) {
			return
		}
		let currentTime = this.getTime()

		this.audioPlayer.playNote(
			currentTime,
			note,
			this.playbackSpeed,
			this.volume,
			this.isPlayalong()
		)
	}

	startNoteAndGetNodes(noteNumber) {
		let source = this.context.createBufferSource()
		let gainNode = this.context.createGain()
		let buffer = this.getBufferForNote(noteNumber, "acoustic_grand_piano")
		source.buffer = buffer
		source.connect(gainNode)

		gainNode.value = 0
		gainNode.gain.setTargetAtTime(0, 0, 0.1)
		gainNode.gain.linearRampToValueAtTime(2, 0, 0.1)
		gainNode.connect(this.context.destination)
		source.start(0, 0.0)
		return { source, gainNode }
	}

	addInputNoteOn(noteNumber) {
		if (this.inputActiveNotes.hasOwnProperty(noteNumber)) {
			console.log("NOTE ALREADY PLAING")
			return
		}
		let audioNote = { wasUsed: false } //this.startNoteAndGetNodes(noteNumber)

		this.inputActiveNotes[noteNumber] = audioNote
	}
	addInputNoteOff(noteNumber) {
		if (!this.inputActiveNotes.hasOwnProperty(noteNumber)) {
			console.log("NOTE NOT PLAYING")
			return
		}
		// this.inputActiveNotes[noteNumber].gainNode.gain.setTargetAtTime(0, 0, 0.05)
		// this.inputActiveNotes[noteNumber].source.stop(0)
		delete this.inputActiveNotes[noteNumber]
	}
}
