import { getSetting } from "../settings/Settings.js"
import { SoundfontLoader } from "../SoundfontLoader.js"
import { getLoader } from "../ui/Loader.js"
import {
	createContinuousAudioNote,
	createCompleteAudioNote
} from "./AudioNote.js"
import { getBufferForNote } from "./Buffers.js"

export class AudioPlayer {
	constructor() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext

		this.context = new AudioContext()
		this.buffers = {}
		this.audioNotes = []
		this.soundfontName = "MusyngKite"

		this.loadMetronomeSounds()
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
		this.audioNotes.forEach(audioNote => {
			try {
				audioNote.source.stop(0)
			} catch (error) {
				//Lets ignore this. Happens when notes are created while jumping on timeline
			}
		})
	}
	createContinuousNote(noteNumber, volume, instrument) {
		if (this.context.state === "suspended") {
			this.wasSuspended = true
			this.context.resume()
		}
		let audioNote = createContinuousAudioNote(
			this.context,
			getBufferForNote(this.soundfontName, instrument, noteNumber),
			volume / 100
		)

		return audioNote
	}
	noteOffContinuous(audioNote) {
		audioNote.endAt(this.context.currentTime + 0.1, false)
	}

	playCompleteNote(currentTime, note, playbackSpeed, volume, isPlayAlong) {
		const buffer = getBufferForNote(
			this.soundfontName,
			note.instrument,
			note.noteNumber
		)

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

	playBeat(time, newMeasure) {
		if (time < 0) return
		this.context.resume()
		let ctxTime = this.context.currentTime

		const source = this.context.createBufferSource()
		const gainNode = this.context.createGain()
		gainNode.gain.value = getSetting("metronomeVolume")
		source.buffer = newMeasure ? this.metronomSound1 : this.metronomSound2
		source.connect(gainNode)
		gainNode.connect(this.context.destination)
		source.start(ctxTime + time)
		source.stop(ctxTime + time + 0.2)
	}

	async switchSoundfont(soundfontName, currentSong) {
		this.soundfontName = soundfontName
		getLoader().setLoadMessage("Loading Instruments")
		await this.loadInstrumentsForSong(currentSong)
		getLoader().setLoadMessage("Loading Buffers")
		return await this.loadBuffers()
	}
	loadMetronomeSounds() {
		let audioPl = this

		const request = new XMLHttpRequest()
		request.open("GET", "../../metronome/1.wav")
		request.responseType = "arraybuffer"
		request.onload = function () {
			let undecodedAudio = request.response
			audioPl.context.decodeAudioData(
				undecodedAudio,
				data => (audioPl.metronomSound1 = data)
			)
		}
		request.send()

		const request2 = new XMLHttpRequest()
		request2.open("GET", "../../metronome/2.wav")
		request2.responseType = "arraybuffer"
		request2.onload = function () {
			let undecodedAudio = request2.response
			audioPl.context.decodeAudioData(
				undecodedAudio,
				data => (audioPl.metronomSound2 = data)
			)
		}
		request2.send()
	}
	async loadInstrumentsForSong(currentSong) {
		if (!this.buffers.hasOwnProperty(this.soundfontName)) {
			this.buffers[this.soundfontName] = {}
		}

		let instrumentsOfSong = currentSong.getAllInstruments()

		//filter instruments we've loaded already and directly map onto promise
		let neededInstruments = instrumentsOfSong
			.filter(
				instrument =>
					!this.buffers[this.soundfontName].hasOwnProperty(instrument)
			)
			.map(instrument =>
				SoundfontLoader.loadInstrument(instrument, this.soundfontName)
			)
		if (instrumentsOfSong.includes("percussion")) {
			neededInstruments.push(
				SoundfontLoader.loadInstrument("percussion", "FluidR3_GM")
			)
		}
		if (neededInstruments.length == 0) {
			return Promise.resolve()
		}
		await Promise.all(neededInstruments)
	}

	async loadBuffers() {
		return await SoundfontLoader.getBuffers(this.context).then(buffers => {
			console.log("Buffers loaded")
			this.loading = false
		})
	}
}
