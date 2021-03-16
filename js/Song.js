import { CONST } from "./data/CONST.js"
export class Song {
	constructor(midiData, fileName, name) {
		this.fileName = fileName
		this.name = name || fileName
		this.text = []
		this.timeSignature
		this.keySignarture
		this.duration = 0
		this.speed = 1
		this.notesBySeconds = {}
		this.controlEvents = []
		this.temporalData = midiData.temporalData
		this.sustainsBySecond = midiData.temporalData.sustainsBySecond

		this.header = midiData.header
		this.tracks = midiData.tracks
		this.markers = []
		this.otherTracks = []
		this.activeTracks = []
		this.microSecondsPerBeat = 10
		this.channels = this.getDefaultChannels()
		this.idCounter = 0

		this.processEvents(midiData)
		console.log(this)
	}
	getStart() {
		return this.getNoteSequence()[0].timestamp
	}
	getEnd() {
		if (!this.end) {
			let noteSequence = this.getNoteSequence().sort(
				(a, b) => a.offTime - b.offTime
			)
			let lastNote = noteSequence[noteSequence.length - 1]
			this.end = lastNote.offTime
		}
		return this.end
	}
	getOffset() {
		if (!this.smpteOffset) {
			return 0 //
		} else {
			return (
				((this.smpteOffset.hour * 60 + this.smpteOffset.min) * 60 +
					this.smpteOffset.sec) *
				1000
			)
		}
	}
	getMeasureLines() {
		if (!this.measureLines) {
			this.setMeasureLines()
		}
		return this.measureLines
	}
	setMeasureLines() {
		let timeSignature = this.timeSignature || {
			numerator: 4,
			denominator: 4,
			thirtySeconds: 8
		}
		let numerator = timeSignature.numerator || 4
		let denominator = timeSignature.denominator || 4
		let thirtySeconds = timeSignature.thirtyseconds || 8

		let beatsPerMeasure = numerator / (denominator * (thirtySeconds / 32))
		let skippedBeats = beatsPerMeasure - 1
		this.measureLines = {}
		Object.keys(this.temporalData.beatsBySecond).forEach(second => {
			this.temporalData.beatsBySecond[second].forEach(beat => {
				if (skippedBeats < beatsPerMeasure - 1) {
					skippedBeats++
					return
				}
				skippedBeats = 0
				if (!this.measureLines.hasOwnProperty(second)) {
					this.measureLines[second] = []
				}
				this.measureLines[second].push(beat)
			})
		})
	}
	setSustainPeriods() {
		this.sustainPeriods = []
		let isOn = false
		for (let second in this.sustainsBySecond) {
			this.sustainsBySecond[second].forEach(sustain => {
				if (isOn) {
					if (!sustain.isOn) {
						isOn = false
						this.sustainPeriods[this.sustainPeriods.length - 1].end =
							sustain.timestamp
					}
				} else {
					if (sustain.isOn) {
						isOn = true
						this.sustainPeriods.push({
							start: sustain.timestamp,
							value: sustain.value
						})
					}
				}
			})
		}
	}
	getMicrosecondsPerBeat() {
		return this.microSecondsPerBeat
	}
	getBPM(time) {
		for (let i = this.temporalData.bpms.length - 1; i >= 0; i--) {
			if (this.temporalData.bpms[i].timestamp < time) {
				return this.temporalData.bpms[i].bpm
			}
		}
	}

	getNotes(from, to) {
		let secondStart = Math.floor(from)
		let secondEnd = Math.floor(to)
		let notes = []
		for (let i = secondStart; i < secondEnd; i++) {
			for (let track in this.activeTracks) {
				if (this.activeTracks[track].notesBySeconds.hasOwnProperty(i)) {
					for (let n in this.activeTracks[track].notesBySeconds[i]) {
						let note = this.activeTracks[track].notesBySeconds[i][n]
						if (note.timestamp > from) {
							notes.push(note)
						}
					}
				}
			}
		}
		return notes
	}
	getAllInstruments() {
		let instruments = {}
		let programs = {}
		this.controlEvents = {}
		this.tracks.forEach(track => {
			track.forEach(event => {
				let channel = event.channel

				if (event.type == "programChange") {
					programs[channel] = event.programNumber
				}

				if (event.type == "controller" && event.controllerType == 7) {
					if (
						!this.controlEvents.hasOwnProperty(
							Math.floor(event.timestamp / 1000)
						)
					) {
						this.controlEvents[Math.floor(event.timestamp / 1000)] = []
					}
					this.controlEvents[Math.floor(event.timestamp / 1000)].push(event)
				}

				if (event.type == "noteOn") {
					if (channel != 9) {
						let program = programs[channel]
						let instrument =
							CONST.INSTRUMENTS.BY_ID[isFinite(program) ? program : channel]
						instruments[instrument.id] = true
						event.instrument = instrument.id
					} else {
						instruments["percussion"] = true
						event.instrument = "percussion"
					}
				}
			})
		})
		return Object.keys(instruments)
	}
	processEvents(midiData) {
		this.setSustainPeriods()
		midiData.tracks.forEach(midiTrack => {
			let newTrack = {
				notes: [],
				meta: [],
				tempoChanges: []
			}

			this.distributeEvents(midiTrack, newTrack)

			if (newTrack.notes.length) {
				this.activeTracks.push(newTrack)
			} else {
				this.otherTracks.push(newTrack)
			}
		})

		this.activeTracks.forEach((track, trackIndex) => {
			track.notesBySeconds = {}
			this.setNoteOffTimestamps(track.notes)
			this.setNoteSustainTimestamps(track.notes)
			track.notes = track.notes.slice(0).filter(note => note.type == "noteOn")
			track.notes.forEach(note => (note.track = trackIndex))
			this.setNotesBySecond(track)
		})
	}
	distributeEvents(track, newTrack) {
		track.forEach(event => {
			event.id = this.idCounter++
			if (event.type == "noteOn" || event.type == "noteOff") {
				newTrack.notes.push(event)
			} else if (event.type == "setTempo") {
				newTrack.tempoChanges.push(event)
			} else if (event.type == "trackName") {
				newTrack.name = event.text
			} else if (event.type == "text") {
				this.text.push(event.text)
			} else if (event.type == "timeSignature") {
				this.timeSignature = event
			} else if (event.type == "keySignature") {
				newTrack.keySignature = event
			} else if (event.type == "smpteOffset") {
				this.smpteOffset = event
			} else if (event.type == "marker") {
				this.markers.push(event)
			} else {
				newTrack.meta.push(event)
			}
		})
	}

	setNotesBySecond(track) {
		track.notes.forEach(note => {
			let second = Math.floor(note.timestamp / 1000)
			if (track.notesBySeconds.hasOwnProperty(second)) {
				track.notesBySeconds[second].push(note)
			} else {
				track.notesBySeconds[second] = [note]
			}
		})
	}
	getNoteSequence() {
		if (!this.notesSequence) {
			let tracks = []
			for (let t in this.activeTracks) [tracks.push(this.activeTracks[t].notes)]

			this.noteSequence = [].concat
				.apply([], tracks)
				.sort((a, b) => a.timestamp - b.timestamp)
		}
		return this.noteSequence.slice(0)
	}
	getNoteRange() {
		let seq = this.getNoteSequence()
		let min = 87
		let max = 0
		seq.forEach(note => {
			if (note.noteNumber > max) {
				max = note.noteNumber
			}
			if (note.noteNumber < min) {
				min = note.noteNumber
			}
		})
		return { min, max }
	}
	setNoteSustainTimestamps(notes) {
		for (let i = 0; i < notes.length; i++) {
			let note = notes[i]
			let currentSustains = this.sustainPeriods.filter(
				period =>
					(period.start < note.timestamp && period.end > note.timestamp) ||
					(period.start < note.offTime && period.end > note.offTime)
			)
			if (currentSustains.length) {
				note.sustainOnTime = currentSustains[0].start
				let end = Math.max.apply(
					null,
					currentSustains.map(sustain => sustain.end)
				)
				note.sustainOffTime = end
				note.sustainDuration = note.sustainOffTime - note.timestamp
			}
		}
	}

	setNoteOffTimestamps(notes) {
		for (let i = 0; i < notes.length; i++) {
			let note = notes[i]
			if (note.type == "noteOn") {
				Song.findOffNote(i, notes.slice(0))
			}
		}
	}

	static findOffNote(index, notes) {
		let onNote = notes[index]
		for (let i = index + 1; i < notes.length; i++) {
			if (
				notes[i].type == "noteOff" &&
				onNote.noteNumber == notes[i].noteNumber
			) {
				onNote.offTime = notes[i].timestamp
				onNote.offVelocity = notes[i].velocity
				onNote.duration = onNote.offTime - onNote.timestamp

				break
			}
		}
	}

	getDefaultChannels() {
		let channels = {}
		for (var i = 0; i <= 15; i++) {
			channels[i] = {
				instrument: i,
				pitchBend: 0,
				volume: 127,
				volumeControl: 50,
				mute: false,
				mono: false,
				omni: false,
				solo: false
			}
		}
		channels[9].instrument = -1
		return channels
	}
}
