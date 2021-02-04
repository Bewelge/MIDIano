import { SoundfontLoader } from "../SoundfontLoader.js"
import { CONST } from "../CONST.js"
import { getLoader } from "../ui/Loader.js"
import {
	createContinuousAudioNote,
	createCompleteAudioNote
} from "./AudioNote.js"

export class AudioPlayer {
	constructor(tracks) {
		window.AudioContext = window.AudioContext || window.webkitAudioContext

		this.context = new AudioContext()
		this.buffers = {}
		this.audioNotes = []
		this.tracks = tracks
		this.soundfontName = "MusyngKite"
	}
	getContextTime() {
		return this.context.currentTime
	}
	getContext() {
		return this.context
	}
	isRunning() {
		return this.context.state == "running"
	}
	resume() {
		this.context.resume()
	}
	suspend() {
		this.context.suspend()
	}
	stopAllSources() {
		this.audioNotes.forEach(audioNote => audioNote.source.stop(0))
	}
	createContinuousNote(midiNoteNumber, volume, instrument) {
		if (this.context.state === "suspended") {
			this.wasSuspended = true
			this.context.resume()
		}
		let audioNote = createContinuousAudioNote(
			this.context,
			this.getBufferForNote(midiNoteNumber, instrument),
			volume / 100
		)

		return audioNote
	}
	noteOffContinuous(audioNote) {
		audioNote.endAt(this.context.currentTime + 0.1, false)
	}

	playCompleteNote(currentTime, note, playbackSpeed, volume, isPlayAlong) {
		const buffer = this.getBufferForNote(note.noteNumber, note.instrument)

		let audioNote = createCompleteAudioNote(
			note,
			currentTime,
			playbackSpeed,
			volume,
			isPlayAlong,
			this.context,
			buffer
		)
		this.audioNotes.push(audioNote)
	}

	async switchSoundfont(soundfontName, currentSong) {
		this.soundfontName = soundfontName
		getLoader().setLoadMessage("Loading Instruments")
		await this.loadInstrumentsForSong(currentSong)
		getLoader().setLoadMessage("Loading Buffers")
		return await this.loadBuffers()
	}

	async loadInstrumentsForSong(currentSong) {
		if (!this.buffers.hasOwnProperty(this.soundfontName)) {
			this.buffers[this.soundfontName] = {}
		}
		//filter instruments we've loaded already and directly map onto promise
		let neededInstruments = currentSong
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

	async loadBuffers() {
		return await SoundfontLoader.getBuffers(
			this.context,
			this.soundfontName
		).then(buffers => {
			console.log("Buffers loaded")
			this.setBuffers(buffers)
			this.loading = false
		})
	}
	setBuffers(buffers) {
		this.buffers[this.soundfontName] = buffers
	}
	getBufferForNote(midiNoteNumber, instrument) {
		let key = CONST.NOTE_TO_KEY[midiNoteNumber]
		let buffer
		try {
			buffer = this.buffers[this.soundfontName][instrument][key]
		} catch (e) {
			console.error(e)
		}
		return buffer
	}
}
