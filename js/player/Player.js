import { MidiLoader } from "../MidiLoader.js"
import { Song } from "../Song.js"
import { AudioPlayer } from "../audio/AudioPlayer.js"
import { getLoader } from "../ui/Loader.js"
import { getSetting } from "../settings/Settings.js"
import { getMidiHandler } from "../MidiInputHandler.js"
import { getCurrentMicNote } from "../MicInputHandler.js"
import {
	getTrackVolume,
	isAnyTrackPlayalong,
	isTrackRequiredToPlay,
	setupTracks
} from "./Tracks.js"
import { Notification } from "../ui/Notification.js"

const LOOK_AHEAD_TIME = 0.2
const LOOK_AHEAD_TIME_WHEN_PLAYALONG = 0.02

class Player {
	constructor() {
		this.audioPlayer = new AudioPlayer()

		getMidiHandler().setNoteOnCallback(this.addInputNoteOn.bind(this))
		getMidiHandler().setNoteOffCallback(this.addInputNoteOff.bind(this))

		this.startDelay = -2.5
		this.lastTime = this.audioPlayer.getContextTime()
		this.progress = 0
		this.paused = true
		this.playing = false
		this.scrolling = 0
		this.loadedSongs = new Set()
		this.muted = false
		this.volume = 100
		this.mutedAtVolume = 100
		this.soundfontName = getSetting("soundfontName")
		this.inputInstrument = "acoustic_grand_piano"
		this.lastMicNote = -1

		this.newSongCallbacks = []
		this.inputActiveNotes = {}
		this.inputPlayedNotes = []

		this.playbackSpeed = 1

		console.log("Player created.")
		this.playTick()
	}
	getState() {
		let time = this.getTime()
		return {
			time: time,
			ctxTime: this.audioPlayer.getContextTime(),
			end: this.song ? this.song.getEnd() : 0,
			loading: this.audioPlayer.loading,
			song: this.song,
			inputActiveNotes: this.inputActiveNotes,
			inputPlayedNotes: this.inputPlayedNotes,
			bpm: this.getBPM(time)
		}
	}
	addNewSongCallback(callback) {
		this.newSongCallbacks.push(callback)
	}
	switchSoundfont(soundfontName) {
		this.wasPaused = this.paused
		this.pause()
		getLoader().startLoad()
		let nowTime = window.performance.now()
		this.soundfontName = soundfontName
		this.audioPlayer.switchSoundfont(soundfontName, this.song).then(resolve => {
			window.setTimeout(() => {
				if (!this.wasPaused) {
					this.resume()
				}
				getLoader().stopLoad()
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
		this.audioPlayer.stopAllSources()
		this.progress += seconds - this.getTime()
		this.resetNoteSequence()
	}
	increaseSpeed(val) {
		this.playbackSpeed = Math.max(
			0,
			Math.round((this.playbackSpeed + val) * 100) / 100
		)
	}
	getChannel(track) {
		if (this.song.activeTracks[track].notes.length) {
			return this.channels[this.song.activeTracks[track].notes[0].channel]
		}
	}
	getCurrentTrackInstrument(trackIndex) {
		let i = 0
		let noteSeq = this.song.getNoteSequence()
		let nextNote = noteSeq[i]
		while (nextNote.track != trackIndex && i < noteSeq.length - 1) {
			i++
			nextNote = noteSeq[i]
		}
		if (nextNote.track == trackIndex) {
			return nextNote.instrument
		}
	}

	async loadSong(theSong, fileName, name) {
		this.audioPlayer.stopAllSources()
		getLoader().startLoad()
		getLoader().setLoadMessage("Loading " + fileName + ".")
		if (this.audioPlayer.isRunning()) {
			this.audioPlayer.suspend()
		}

		this.loading = true

		getLoader().setLoadMessage("Parsing Midi File.")
		try {
			let midiFile = await MidiLoader.loadFile(theSong)
			this.setSong(new Song(midiFile, fileName, name))
			getLoader().setLoadMessage("Loading Instruments")

			await this.audioPlayer.loadInstrumentsForSong(this.song)

			getLoader().setLoadMessage("Creating Buffers")
			return this.audioPlayer.loadBuffers().then(v => getLoader().stopLoad())
		} catch (error) {
			console.log(error)
			Notification.create("Couldn't read Midi-File - " + error, 2000)
			getLoader().stopLoad()
		}
	}

	setSong(song) {
		this.pause()
		this.playing = false
		this.paused = true
		this.wasPaused = true
		this.progress = 0
		this.scrollOffset = 0
		this.song = song
		if (this.loadedSongs.has(song)) {
			this.loadedSongs.add(song)
		}
		setupTracks(song.activeTracks)
		this.newSongCallbacks.forEach(callback => callback())
	}
	startPlay() {
		console.log("Starting Song")
		this.wasPaused = false

		this.resetNoteSequence()
		this.lastTime = this.audioPlayer.getContextTime()
		this.resume()
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
			if (this.song && newTime > 1 + this.song.getEnd() / 1000) {
				this.scrolling = 0
				newScrollOffset =
					this.getTimeWithoutScrollOffset() - (1 + this.song.getEnd() / 1000)
				this.scrollOffset + (1 + this.song.getEnd() / 1000 - this.getTime()) ||
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
	playTick() {
		let currentContextTime = this.audioPlayer.getContextTime()

		let delta = (currentContextTime - this.lastTime) * this.playbackSpeed

		//Setting doesnt exist yet. Pitch detection is too bad for a whole piano.
		this.addMicInputNotes()

		this.clearOldPlayedInputNotes()

		//cap max updaterate.
		if (delta < 0.0069) {
			this.requestNextTick()
			return
		}

		let oldProgress = this.progress
		this.lastTime = currentContextTime
		if (!this.paused && this.scrolling == 0) {
			this.progress += Math.min(0.1, delta)
		} else {
			this.requestNextTick()
			return
		}

		let soundfontName = getSetting("soundfontName")
		if (soundfontName != this.soundfontName) {
			this.switchSoundfont(soundfontName)
			this.requestNextTick()
			return
		}

		let currentTime = this.getTime()

		if (this.isSongEnded(currentTime - 5)) {
			this.pause()
			this.requestNextTick()
			return
		}
		if (getSetting("enableMetronome")) {
			this.playMetronomeBeats(currentTime)
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
				this.noteSequence[0] &&
				(!isTrackRequiredToPlay(this.noteSequence[0].track) ||
					this.isInputKeyPressed(this.noteSequence[0].noteNumber))
			) {
				this.playNote(this.noteSequence.shift())
			} else {
				this.progress = oldProgress
				break
			}
		}

		this.requestNextTick()
	}

	playMetronomeBeats(currentTime) {
		this.playedBeats = this.playedBeats || {}
		let beatsBySecond = getCurrentSong().temporalData.beatsBySecond
		let secondsToCheck = [Math.floor(currentTime), Math.floor(currentTime) + 1]
		secondsToCheck.forEach(second => {
			if (beatsBySecond[second]) {
				beatsBySecond[second].forEach(beatTimestamp => {
					if (
						!this.playedBeats.hasOwnProperty(beatTimestamp) &&
						beatTimestamp / 1000 < currentTime + 0.5
					) {
						let newMeasure =
							getCurrentSong().measureLines[Math.floor(beatTimestamp / 1000)] &&
							getCurrentSong().measureLines[
								Math.floor(beatTimestamp / 1000)
							].includes(beatTimestamp)
						this.playedBeats[beatTimestamp] = true
						this.audioPlayer.playBeat(
							beatTimestamp / 1000 - currentTime,
							newMeasure
						)
					}
				})
			}
		})
	}

	clearOldPlayedInputNotes() {
		//TODO - Clear those that arent displayed anymore.. And/Or save them somewhere for playback.
	}

	addMicInputNotes() {
		if (getSetting("micInputEnabled")) {
			let currentMicNote = getCurrentMicNote()

			// console.log(currentMicFrequency)
			if (this.lastMicNote != currentMicNote) {
				if (this.lastMicNote > -1) {
					this.addInputNoteOff(this.lastMicNote)
				}
				if (currentMicNote > -1) {
					this.addInputNoteOn(currentMicNote)
				}
			}
			this.lastMicNote = currentMicNote
		}
	}

	requestNextTick() {
		window.requestAnimationFrame(this.playTick.bind(this))
	}

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
		let lookahead = isAnyTrackPlayalong()
			? LOOK_AHEAD_TIME_WHEN_PLAYALONG
			: LOOK_AHEAD_TIME
		return (
			this.noteSequence.length &&
			this.noteSequence[0].timestamp / 1000 <
				currentTime + lookahead * this.playbackSpeed
		)
	}

	stop() {
		this.progress = 0
		this.scrollOffset = 0
		this.playing = false
		this.pause()
	}
	resume() {
		if (!this.song || !this.paused) return
		console.log("Resuming Song")
		this.paused = false
		this.resetNoteSequence()
		this.audioPlayer.resume()
	}
	resetNoteSequence() {
		this.noteSequence = this.song.getNoteSequence()
		this.noteSequence = this.noteSequence.filter(
			note => note.timestamp > this.getTime()
		)
		this.inputActiveNotes = {}
		this.playedBeats = {}
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

		if (getMidiHandler().isOutputActive()) {
			getMidiHandler().playNote(
				note.noteNumber + 21,
				note.velocity,
				note.noteOffVelocity,
				(note.timestamp - currentTime * 1000) / this.playbackSpeed,
				(note.offTime - currentTime * 1000) / this.playbackSpeed
			)
		} else {
			this.audioPlayer.playCompleteNote(
				currentTime,
				note,
				this.playbackSpeed,
				this.getNoteVolume(note),
				isAnyTrackPlayalong()
			)
		}
	}
	getNoteVolume(note) {
		return (
			(this.volume / 100) *
			(getTrackVolume(note.track) / 100) *
			(note.channelVolume / 127)
		)
	}

	addInputNoteOn(noteNumber) {
		if (this.inputActiveNotes.hasOwnProperty(noteNumber)) {
			console.log("NOTE ALREADY PLAING")
			this.audioPlayer.noteOffContinuous(
				this.inputActiveNotes[noteNumber].audioNote
			)
			delete this.inputActiveNotes[noteNumber]
		}
		let audioNote = this.audioPlayer.createContinuousNote(
			noteNumber,
			this.volume,
			this.inputInstrument
		)
		let activeNoteObj = {
			audioNote: audioNote,
			wasUsed: false,
			noteNumber: noteNumber,
			timestamp: this.audioPlayer.getContextTime() * 1000
		}

		this.inputActiveNotes[noteNumber] = activeNoteObj
	}
	addInputNoteOff(noteNumber) {
		if (!this.inputActiveNotes.hasOwnProperty(noteNumber)) {
			console.log("NOTE NOT PLAYING")
			return
		}
		this.audioPlayer.noteOffContinuous(
			this.inputActiveNotes[noteNumber].audioNote
		)
		this.inputActiveNotes[noteNumber].offTime =
			this.audioPlayer.getContextTime() * 1000
		this.inputPlayedNotes.push(this.inputActiveNotes[noteNumber])

		delete this.inputActiveNotes[noteNumber]
	}
}
const thePlayer = new Player()
export const getPlayer = () => {
	return thePlayer
}

export const getCurrentSong = () => {
	return thePlayer.song
}

export const getPlayerState = () => {
	return thePlayer.getState()
}
