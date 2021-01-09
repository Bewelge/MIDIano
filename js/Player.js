import { MidiLoader } from "./MidiLoader.js"
import { Song } from "./Song.js"
import { SoundfontLoader } from "./SoundfontLoader.js"
import { CONST } from "./CONST.js"
import { MidiInputHandler } from "./MidiInputHandler.js"
const LOOK_AHEAD_TIME = 0.2
const LOOK_AHEAD_TIME_WHEN_PLAYALONG = 0.02
export class Player {
	constructor(buffers) {
		window.AudioContext = window.AudioContext || window.webkitAudioContext
		this.soundfontName = "MusyngKite"

		this.buffers = buffers || {}
		this.sources = []
		this.tracks = {}

		this.context = new AudioContext()
		this.midiInputHandler = new MidiInputHandler()
		this.midiInputHandler.setNoteOnCallback(this.addInputNoteOn.bind(this))
		this.midiInputHandler.setNoteOffCallback(this.addInputNoteOff.bind(this))
		this.startDelay = -2
		this.lastTime = this.context.currentTime
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
	}
	getState() {
		return {
			time: this.getTime(),
			end: this.song ? this.song.getEnd() : 0,
			loading: this.loading,
			song: this.song,
			tracks: this.tracks,
			inputActiveNotes: this.inputActiveNotes
		}
	}
	addNewSongCallback(callback) {
		this.newSongCallbacks.push(callback)
	}
	switchSoundfont(soundfontName) {
		this.pause()
		//TODO: WHY IS THIS NOT PAUSING?! Throws errors, but works...
		this.soundfontName = soundfontName
		this.loadSoundfont()
	}
	async loadSoundfont() {
		await this.loadInstrumentsForSong()
		await this.loadBuffers()
	}
	getContext() {
		return this.context
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
	setupTracks() {
		this.tracks = {}
		for (let t in this.song.activeTracks) {
			if (!this.tracks.hasOwnProperty(t)) {
				this.tracks[t] = {
					draw: true,
					color: CONST.TRACK_COLORS[t % 4],
					volume: 100,
					name: this.song.activeTracks[t].name || "Track " + t,
					requiredToPlay: false
				}
			}
			this.tracks[t].color = CONST.TRACK_COLORS[t % 4]
		}
	}

	async loadBuffers() {
		return await SoundfontLoader.getBuffers(
			this.context,
			this.soundfontName
		).then(buffers => {
			console.log("Buffers loaded")
			this.setBuffers(buffers)
			this.onloadStopCallbacks.forEach(callback => callback())
			this.loading = false
		})
	}
	async loadSong(theSong, fileName, setLoadMessage) {
		setLoadMessage("Loading " + fileName + ".")
		if (this.context.state == "running") {
			this.context.suspend()
		}

		this.onloadStartCallbacks.forEach(callback => callback())

		this.playing = false
		this.progress = 0
		this.scrollOffset = 0
		this.paused = true
		this.loading = true

		setLoadMessage("Parsing Midi File.")
		let midiFile = await MidiLoader.loadFile(theSong)
		this.currentSong = new Song(midiFile, fileName)
		setLoadMessage("Loading Instruments")

		this.setSong(this.currentSong)
		this.loadedSongs.add(this.currentSong)

		await this.loadInstrumentsForSong()

		this.setupTracks()
		this.newSongCallbacks.forEach(callback => callback())
		setLoadMessage("Creating Buffers")
		return this.loadBuffers()
	}
	async loadInstrumentsForSong() {
		if (!this.buffers.hasOwnProperty(this.soundfontName)) {
			this.buffers[this.soundfontName] = {}
		}
		//filter instruments we've loaded already and directly map onto promise
		let neededInstruments = this.currentSong
			.getAllInstruments()
			.filter(
				instrument =>
					!this.buffers[this.soundfontName].hasOwnProperty(instrument)
			)
			.map(instrument =>
				SoundfontLoader.loadInstrument(instrument, this.soundfontName)
			)
		if (neededInstruments.length == 0) {
			return Promise.resolve()
		}
		await Promise.all(neededInstruments)
	}

	setBuffers(buffers) {
		this.buffers[this.soundfontName] = buffers
	}
	setSong(song) {
		this.pause()
		this.playing = false
		this.paused = true
		this.progress = 0
		this.scrollOffset = 0
		this.song = song
	}
	startPlay() {
		if (!this.song) return false

		console.log("Starting Song")
		this.paused = false
		this.playing = true
		this.resetNoteSequence()
		this.lastTime = this.context.currentTime
		this.context.resume()
		this.play()
		return true
	}
	handleScroll(stacksize) {
		if (this.scrolling != 0) {
			if (!this.song) {
				this.scrolling = 0
				return
			}
			this.lastTime = this.context.currentTime
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

	play() {
		if (this.scrolling != 0) {
			window.setTimeout(this.play.bind(this), 20)
			return
		}

		let delta = (this.context.currentTime - this.lastTime) * this.playbackSpeed
		//cap max framerate.
		if (delta < 0.0069) {
			window.requestAnimationFrame(this.play.bind(this))
			return
		}
		let oldProgress = this.progress
		console.log(this.paused)
		if (!this.paused) {
			this.progress += delta
		}
		this.lastTime = this.context.currentTime

		let currentTime = this.getTime()

		if (this.isSongEnded(currentTime)) {
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
		this.resetNoteSequence()
		this.context.resume()
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
	}

	playNote(note) {
		if (!note.hasOwnProperty("channel") || !note.hasOwnProperty("noteNumber")) {
			return
		}
		let currentTime = this.getTime()
		let contextTime = this.context.currentTime
		let delay = (note.timestamp / 1000 - currentTime) / this.playbackSpeed
		let delayCorrection = 0
		if (delay < 0) {
			if (!this.isPlayalong()) return
			console.log("negative delay")
			delayCorrection = -1 * (delay - 0.1)
			delay = 0.1
		}

		let buffer = this.getBufferForNote(note.noteNumber, note.instrument)
		let clampedGain = this.getClampedGain(note)
		if (clampedGain == 0) {
			return
		}

		const startTime = contextTime + delay
		const endTime =
			startTime + note.duration / 1000 / this.playbackSpeed + delayCorrection

		let source = this.context.createBufferSource()
		let gainNode = this.context.createGain()
		source.buffer = buffer
		source.connect(gainNode)

		gainNode.value = 0
		gainNode.gain.setTargetAtTime(0, contextTime, 0.05)
		gainNode.gain.setTargetAtTime(
			0,
			Math.max(contextTime, startTime - 0.02),
			0.05
		)
		gainNode.gain.linearRampToValueAtTime(clampedGain, startTime, 0.05)
		gainNode.gain.setTargetAtTime(clampedGain, endTime, 0.05)
		gainNode.gain.exponentialRampToValueAtTime(0.001, endTime + 0.5)
		//gainNode.gain.linearRampToValueAtTime(0, contextTime + delay + (note.duration / 1000) / this.playbackSpeed + 0.1)
		gainNode.connect(this.context.destination)

		source.start(Math.max(0, startTime))
		source.stop(endTime + 1)

		this.sources.push(source)
	}
	getBufferForNote(noteNumber, noteInstrument) {
		let key = CONST.NOTE_TO_KEY[noteNumber]
		let buffer
		try {
			buffer = this.buffers[this.soundfontName][noteInstrument][key]
		} catch (e) {
			console.error(e)
		}
		return buffer
	}

	getClampedGain(note) {
		let track = this.tracks[note.track]
		let gain =
			2 +
			(((note.velocity / 127) * 2 * note.channelVolume) / 127) *
				(track.volume / 100) *
				(this.volume / 100)

		let clampedGain = Math.min(5.0, Math.max(-1.0, gain))
		return clampedGain
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
