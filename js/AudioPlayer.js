import { SoundfontLoader } from "./SoundfontLoader.js"
import { CONST } from "./CONST.js"

export class AudioPlayer {
	constructor(tracks, settings) {
		window.AudioContext = window.AudioContext || window.webkitAudioContext
		this.context = new AudioContext()
		this.buffers = {}
		this.sources = []
		this.tracks = tracks
		this.soundfontName = "MusyngKite"
		this.settings = settings
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
	playNote(currentTime, note, playbackSpeed, volume, isPlayAlong) {
		let delayUntilNote = (note.timestamp / 1000 - currentTime) / playbackSpeed
		let delayCorrection = 0
		if (delayUntilNote < 0) {
			if (!isPlayAlong) return
			console.log("negative delay")
			delayCorrection = -1 * (delayUntilNote - 0.1)
			delayUntilNote = 0.1
		}

		const contextTime = this.getContextTime()
		let buffer = this.getBufferForNote(note.noteNumber, note.instrument)
		let clampedGain = this.getClampedGain(note, volume)
		if (clampedGain == 0) {
			return
		}
		let startTime = contextTime + delayUntilNote
		let endTime =
			startTime + note.duration / 1000 / playbackSpeed + delayCorrection

		let sustainOffTime = startTime + note.sustainDuration / 1000 / playbackSpeed
		const isSustained = endTime < sustainOffTime

		let attack = Math.min(0.001, (endTime - startTime) / 2)
		let sustain = 0.8
		let decay = 0.5
		let releasePedal = 0.1
		let releaseKey = 0.1
		const timeConst = 0.05

		let source = this.context.createBufferSource()
		let gainNode = this.context.createGain()
		source.buffer = buffer
		source.connect(gainNode)

		gainNode.value = 0
		//start at zero
		gainNode.gain.setTargetAtTime(0, 0, timeConst)
		gainNode.gain.linearRampToValueAtTime(
			0,
			Math.max(contextTime, startTime),
			timeConst
		)
		//Attack //TODO implement Harmonic scale if sustained?
		gainNode.gain.linearRampToValueAtTime(
			clampedGain,
			startTime + attack,
			timeConst
		)

		if (!isSustained || !this.settings.sustainEnabled) {
			//Sustain
			gainNode.gain.linearRampToValueAtTime(clampedGain, endTime, timeConst)
			//Release
			gainNode.gain.exponentialRampToValueAtTime(0.001, endTime + releaseKey)
			gainNode.gain.linearRampToValueAtTime(
				0,
				endTime + releaseKey + 0.001,
				timeConst
			)
		} else {
			let decayedGain =
				clampedGain *
				Math.pow(0.999, Math.max(1, (sustainOffTime - startTime) / 10))
			//Sustain
			gainNode.gain.linearRampToValueAtTime(clampedGain, sustainOffTime)
			//Release
			gainNode.gain.exponentialRampToValueAtTime(
				0.001,
				sustainOffTime + releasePedal
			)
			gainNode.gain.linearRampToValueAtTime(
				0,
				sustainOffTime + releasePedal + 0.001,
				timeConst
			)
		}

		gainNode.connect(this.context.destination)

		source.start(Math.max(0, startTime))
		source.stop(isSustained ? note.sustainOffTime + 1 : endTime + 1)

		this.sources.push(source)
	}
	async switchSoundfont(soundfontName, currentSong, setLoadMessage) {
		this.soundfontName = soundfontName
		setLoadMessage("Loading Instruments")
		await this.loadInstrumentsForSong(currentSong)
		setLoadMessage("Loading Buffers")
		return await this.loadBuffers()
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

	getClampedGain(note, volume) {
		let track = this.tracks[note.track]
		let gain =
			2 *
			(note.velocity / 127) *
			(note.channelVolume / 127) *
			(track.volume / 100) *
			(volume / 100)

		let clampedGain = Math.min(2.0, Math.max(-1.0, gain))
		return clampedGain
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
}
