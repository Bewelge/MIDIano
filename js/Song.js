import { CONST } from "./CONST.js"
export class Song {
	constructor(midiData, fileName) {
		this.fileName = fileName
		this.name = ""
		this.text = []
		this.timeSignature
		this.keySignarture
		this.duration = 0
		this.speed = 1
		this.notesBySeconds = {}
		this.controlEvents = []
		this.bpms = midiData.bpms

		this.header = midiData.header
		this.tracks = midiData.tracks
		this.otherTracks = []
		this.activeTracks = []
		this.microSecondsPerBeat = 10
		this.channels = this.getDefaultChannels()

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
	setTempoLines() {
		let timeSignature = this.timeSignature
		let numerator = timeSignature.numerator || 4
		let denominator = timeSignature.denominator || 4
		let thirtySecond = timeSignature.thirtyseconds || 8

		let bpms = this.bpms.slice(0)

		let timestamp = 0
		let timeInBeat = 0
		let beatsDone = 0
		let timeSig = numerator / denominator
		let tempoLines = {}
		let bpm = 120
		let bps = 2
		let milisecondsPerBeat = (1000 / bps) * timeSig
		while (bpms.length) {
			bpm = bpms[0].bpm
			bps = bpm / 60
			milisecondsPerBeat = (1000 / bps) * timeSig
			timestamp++
			timeInBeat++

			if (timeInBeat >= milisecondsPerBeat) {
				beatsDone++
				timeInBeat -= milisecondsPerBeat
				let second = Math.floor(timestamp / 1000)
				if (!tempoLines.hasOwnProperty(second)) {
					tempoLines[second] = []
				}

				tempoLines[second].push(timestamp - timeInBeat)
			}
			if (timestamp > bpms[0].timestamp) {
				bpms.splice(0, 1)
			}
		}
		while (timestamp < this.getEnd()) {
			timestamp++
			timeInBeat++
			if (timeInBeat >= milisecondsPerBeat) {
				beatsDone++
				timeInBeat -= milisecondsPerBeat
				let second = Math.floor(timestamp / 1000)
				if (!tempoLines.hasOwnProperty(second)) {
					tempoLines[second] = []
				}

				tempoLines[second].push(timestamp)
			}
		}
		console.log(tempoLines)
		this.tempoLines = tempoLines
	}
	getTempoLines() {
		if (!this.tempoLines) {
			this.setTempoLines()
		}
		return this.tempoLines
	}
	getMicrosecondsPerBeat() {
		return this.microSecondsPerBeat
	}
	getBPM(time) {
		for (let i = this.bpms.length - 1; i >= 0; i--) {
			if (this.bpms[i].timestamp < time) {
				return this.bpms[i].bpm
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
		midiData.tracks.forEach(track => {
			let newTrack = {
				notes: [],
				meta: [],
				tempoChanges: []
			}

			this.distributeEvents(track, newTrack)

			if (newTrack.notes.length) {
				this.activeTracks.push(newTrack)
			} else {
				this.otherTracks.push(newTrack)
			}
		})

		this.activeTracks.forEach((track, trackIndex) => {
			track.notesBySeconds = {}
			Song.processNotes(track.notes)
			track.notes = track.notes.slice(0).filter(note => note.type == "noteOn")
			track.notes.forEach(note => (note.track = trackIndex))
			this.setNotesBySecond(track)
		})
	}
	distributeEvents(track, newTrack) {
		track.forEach(event => {
			if (event.type == "noteOn" || event.type == "noteOff" || ((event.type=="controller") && (event.controllerType==64) )) {
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
				newTrack.keySignarture = event
			} else if (event.type == "smpteOffset") {
				this.smpteOffset = event
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

	static processNotes(notes) {
		let sustainPedalOn = false
		for (let i = 0; i < notes.length; i++) {
			let note = notes[i]
			if (note.type == "controller") {
				sustainPedalOn = note.value > 64
			}
			if (note.type == "noteOn") {
				Song.findOffNote(i, notes.slice(0), sustainPedalOn)
			}
		}
	}

	static findOffNote(index, notes, sustainPedalOnStart) {
		let onNote = notes[index]
		let sustainPedalOn = sustainPedalOnStart
		let noteOffWasHit = false
		let noteWasRepeated = false
		for (let i = index + 1; i < notes.length; i++) {
			if (notes[i].type == "controller" && notes[i].controllerType==64) {
				sustainPedalOn = notes[i].value > 64
			}			
			if (
				notes[i].type == "noteOff" &&
				onNote.noteNumber == notes[i].noteNumber
			) {
				noteOffWasHit = true
				onNote.offTime = notes[i].timestamp			
			}
			if (
				notes[i].type == "noteOn" &&
				onNote.noteNumber == notes[i].noteNumber
			) {
				noteWasRepeated = true
			}			
			if ((noteOffWasHit == true && sustainPedalOn==false) 
				|| noteWasRepeated)
			{
				onNote.duration = notes[i].timestamp - onNote.timestamp
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
