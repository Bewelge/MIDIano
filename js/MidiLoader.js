export class MidiLoader {
	/**
	 *
	 * @param {String} url
	 */
	static async loadFile(url) {
		const response = await fetch(url)
		if (response.ok) {
			let arrayBuffer = await response.arrayBuffer()
			if (arrayBuffer) {
				arrayBuffer = new Uint8Array(arrayBuffer)

				return parseMidi(arrayBuffer)
			}
		} else {
			throw new Error(`could not load ${url}`)
		}
	}
}
function parseMidi(data) {
	var p = new Parser(data)

	var headerChunk = p.readChunk()
	if (headerChunk.id != "MThd")
		throw "Bad MIDI file.  Expected 'MHdr', got: '" + headerChunk.id + "'"
	var header = parseHeader(headerChunk.data)

	var tracks = []
	for (var i = 0; !p.eof() && i < header.numTracks; i++) {
		var trackChunk = p.readChunk()
		if (trackChunk.id != "MTrk")
			throw "Bad MIDI file.  Expected 'MTrk', got: '" + trackChunk.id + "'"
		var track = parseTrack(trackChunk.data)
		tracks.push(track)
	}

	let midiData = {
		header: header,
		tracks: tracks
	}

	let temporalData = Parser.setTemporal(midiData)
	return {
		header: header,
		tracks: tracks,
		temporalData: temporalData
	}
}

function parseHeader(data) {
	var p = new Parser(data)

	var format = p.readUInt16()
	var numTracks = p.readUInt16()

	var result = {
		format: format,
		numTracks: numTracks
	}

	var timeDivision = p.readUInt16()
	if (timeDivision & 0x8000) {
		result.framesPerSecond = 0x100 - (timeDivision >> 8)
		result.ticksPerFrame = timeDivision & 0xff
	} else {
		result.ticksPerBeat = timeDivision
	}

	return result
}

function parseTrack(data) {
	let parser = new Parser(data)

	let events = []
	while (!parser.eof()) {
		let event = readEvent()
		events.push(event)
	}

	return events

	var lastEventTypeByte = null

	function readEvent() {
		var event = {}
		event.deltaTime = parser.readVarInt()

		var eventTypeByte = parser.readUInt8()

		if ((eventTypeByte & 0xf0) === 0xf0) {
			// system / meta event
			if (eventTypeByte === 0xff) {
				// meta event
				event.meta = true
				var metatypeByte = parser.readUInt8()
				var length = parser.readVarInt()
				switch (metatypeByte) {
					case 0x00:
						event.type = "sequenceNumber"
						if (length !== 2)
							throw (
								"Expected length for sequenceNumber event is 2, got " + length
							)
						event.number = parser.readUInt16()
						return event
					case 0x01:
						event.type = "text"
						event.text = parser.readString(length)
						return event
					case 0x02:
						event.type = "copyrightNotice"
						event.text = parser.readString(length)
						return event
					case 0x03:
						event.type = "trackName"
						event.text = parser.readString(length)
						return event
					case 0x04:
						event.type = "instrumentName"
						event.text = parser.readString(length)
						return event
					case 0x05:
						event.type = "lyrics"
						event.text = parser.readString(length)
						return event
					case 0x06:
						event.type = "marker"
						event.text = parser.readString(length)
						return event
					case 0x07:
						event.type = "cuePoint"
						event.text = parser.readString(length)
						return event
					case 0x20:
						event.type = "channelPrefix"
						if (length != 1)
							throw (
								"Expected length for channelPrefix event is 1, got " + length
							)
						event.channel = parser.readUInt8()
						return event
					case 0x21:
						event.type = "portPrefix"
						if (length != 1)
							throw "Expected length for portPrefix event is 1, got " + length
						event.port = parser.readUInt8()
						return event
					case 0x2f:
						event.type = "endOfTrack"
						if (length != 0)
							throw "Expected length for endOfTrack event is 0, got " + length
						return event
					case 0x51:
						event.type = "setTempo"
						if (length != 3)
							throw "Expected length for setTempo event is 3, got " + length
						event.microsecondsPerBeat = parser.readUInt24()
						return event
					case 0x54:
						event.type = "smpteOffset"
						if (length != 5)
							throw "Expected length for smpteOffset event is 5, got " + length
						var hourByte = parser.readUInt8()
						var FRAME_RATES = { 0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30 }
						event.frameRate = FRAME_RATES[hourByte & 0x60]
						event.hour = hourByte & 0x1f
						event.min = parser.readUInt8()
						event.sec = parser.readUInt8()
						event.frame = parser.readUInt8()
						event.subFrame = parser.readUInt8()
						return event
					case 0x58:
						event.type = "timeSignature"
						if (length != 4)
							throw (
								"Expected length for timeSignature event is 4, got " + length
							)
						event.numerator = parser.readUInt8()
						event.denominator = 1 << parser.readUInt8()
						event.metronome = parser.readUInt8()
						event.thirtyseconds = parser.readUInt8()
						return event
					case 0x59:
						event.type = "keySignature"
						if (length != 2)
							throw "Expected length for keySignature event is 2, got " + length
						event.key = parser.readInt8()
						event.scale = parser.readUInt8()
						return event
					case 0x7f:
						event.type = "sequencerSpecific"
						event.data = parser.readBytes(length)
						return event
					default:
						event.type = "unknownMeta"
						event.data = parser.readBytes(length)
						event.metatypeByte = metatypeByte
						return event
				}
			} else if (eventTypeByte == 0xf0) {
				event.type = "sysEx"
				var length = parser.readVarInt()
				event.data = parser.readBytes(length)
				return event
			} else if (eventTypeByte == 0xf7) {
				event.type = "endSysEx"
				var length = parser.readVarInt()
				event.data = parser.readBytes(length)
				return event
			} else {
				throw "Unrecognised MIDI event type byte: " + eventTypeByte
			}
		} else {
			// channel event
			var param1
			if ((eventTypeByte & 0x80) === 0) {
				// running status - reuse lastEventTypeByte as the event type.
				// eventTypeByte is actually the first parameter
				if (lastEventTypeByte === null)
					throw "Running status byte encountered before status byte"
				param1 = eventTypeByte
				eventTypeByte = lastEventTypeByte
				event.running = true
			} else {
				param1 = parser.readUInt8()
				lastEventTypeByte = eventTypeByte
			}
			var eventType = eventTypeByte >> 4
			event.channel = eventTypeByte & 0x0f
			switch (eventType) {
				case 0x08:
					event.type = "noteOff"
					event.midiNoteNumber = param1
					event.noteNumber = param1 - 21
					event.velocity = parser.readUInt8()
					return event
				case 0x09:
					var velocity = parser.readUInt8()
					event.type = velocity === 0 ? "noteOff" : "noteOn"
					event.midiNoteNumber = param1
					event.noteNumber = param1 - 21
					event.velocity = velocity
					if (velocity === 0) event.byte9 = true
					return event
				case 0x0a:
					event.type = "noteAftertouch"
					event.midiNoteNumber = param1
					event.noteNumber = param1 - 21
					event.amount = parser.readUInt8()
					return event
				case 0x0b:
					event.type = "controller"
					event.controllerType = param1
					event.value = parser.readUInt8()
					return event
				case 0x0c:
					event.type = "programChange"
					event.programNumber = param1
					return event
				case 0x0d:
					event.type = "channelAftertouch"
					event.amount = param1
					return event
				case 0x0e:
					event.type = "pitchBend"
					event.value = param1 + (parser.readUInt8() << 7) - 0x2000
					return event
				default:
					throw "Unrecognised MIDI event type: " + eventType
			}
		}
	}
}

class Parser {
	constructor(data) {
		this.buffer = data
		this.bufferLen = this.buffer.length
		this.pos = 0
	}

	eof() {
		return this.pos >= this.bufferLen
	}
	readUInt8() {
		let result = this.buffer[this.pos]
		this.pos += 1
		return result
	}
	readInt8() {
		let u = this.readUInt8()
		return u & 0x80 ? u - 0x100 : u
	}
	readUInt16() {
		let b0 = this.readUInt8()
		let b1 = this.readUInt8()
		return (b0 << 8) + b1
	}
	readInt16() {
		let u = this.readUInt16()
		return u & 0x8000 ? u - 0x10000 : u
	}
	readUInt24() {
		let b0 = this.readUInt8()
		let b1 = this.readUInt8()
		let b2 = this.readUInt8()
		return (b0 << 16) + (b1 << 8) + b2
	}
	readInt24() {
		let u = this.readUInt24()
		return u & 0x800000 ? u - 0x1000000 : u
	}
	readUInt32() {
		let b0 = this.readUInt8()
		let b1 = this.readUInt8()
		let b2 = this.readUInt8()
		let b3 = this.readUInt8()
		return (b0 << 24) + (b1 << 16) + (b2 << 8) + b3
	}
	readBytes(length) {
		let bytes = this.buffer.slice(this.pos, this.pos + length)
		this.pos += length
		return bytes
	}
	readString(length) {
		let bytes = this.readBytes(length)
		return String.fromCharCode.apply(null, bytes)
	}
	readVarInt() {
		let result = 0
		while (!this.eof()) {
			let b = this.readUInt8()
			if (b & 0x80) {
				result += b & 0x7f
				result <<= 7
			} else {
				return result + b
			}
		}
		return result
	}
	readChunk() {
		let id = this.readString(4)
		let length = this.readUInt32()
		let data = this.readBytes(length)
		return {
			id: id,
			data: data,
			length: length
		}
	}

	/*********
	 * <ADAPTED FROM JASMID>
	 * Replayer.js
	 *********/
	static setTemporal(midiObj) {
		let trackStates = []
		let beatsPerMinute = 120
		let ticksPerBeat = midiObj.header.ticksPerBeat
		var totTime = 0
		var bpms = []
		var generatedBeats = 0
		var beatsBySecond = { 0: [0] }
		var sustainsBySecond = {}
		let channels = getDefaultChannels()
		for (let t in midiObj.tracks) {
			let track = midiObj.tracks[t]
			trackStates.push({
				nextEventIndex: 0,
				ticksToNextEvent: track.length ? track[0].deltaTime : null
			})
		}
		var midiEvent

		function getNextEvent() {
			var ticksToNextEvent = null
			var nextEventTrack = null
			var nextEventIndex = null

			//search all tracks for next event.
			for (var i = 0; i < trackStates.length; i++) {
				if (
					trackStates[i].ticksToNextEvent != null &&
					(ticksToNextEvent == null ||
						trackStates[i].ticksToNextEvent < ticksToNextEvent)
				) {
					ticksToNextEvent = trackStates[i].ticksToNextEvent
					nextEventTrack = i
					nextEventIndex = trackStates[i].nextEventIndex
				}
			}
			if (nextEventTrack != null) {
				// get next event from that track and
				var nextEvent = midiObj.tracks[nextEventTrack][nextEventIndex]
				if (midiObj.tracks[nextEventTrack][nextEventIndex + 1]) {
					trackStates[nextEventTrack].ticksToNextEvent +=
						midiObj.tracks[nextEventTrack][nextEventIndex + 1].deltaTime
				} else {
					trackStates[nextEventTrack].ticksToNextEvent = null
				}
				trackStates[nextEventTrack].nextEventIndex += 1
				// advance timings on all tracks
				for (var i = 0; i < trackStates.length; i++) {
					if (trackStates[i].ticksToNextEvent != null) {
						trackStates[i].ticksToNextEvent -= ticksToNextEvent
					}
				}
				return {
					ticksToEvent: ticksToNextEvent,
					event: nextEvent,
					track: nextEventTrack
				}
			} else {
				return null
			}
		} //end getNextEvent

		function processNext() {
			let newBPM = false
			if (midiEvent.event.type == "setTempo") {
				// tempo change events can occur anywhere in the middle and affect events that follow
				beatsPerMinute = 60000000 / midiEvent.event.microsecondsPerBeat
				newBPM = true
			}
			if (
				midiEvent.event.type == "controller" &&
				midiEvent.event.controllerType == 7
			) {
				channels[midiEvent.event.channel].volume = midiEvent.event.value
			}

			var beatsToGenerate = 0
			var secondsToGenerate = 0
			if (midiEvent.ticksToEvent > 0) {
				beatsToGenerate = midiEvent.ticksToEvent / ticksPerBeat
				secondsToGenerate = beatsToGenerate / (beatsPerMinute / 60)
			}
			var time = secondsToGenerate * 1000 || 0
			midiEvent.event.temporalDelta = time
			totTime += time
			midiEvent.event.timestamp = totTime

			//Keep track of sustain on/offs
			if (
				midiEvent.event.type == "controller" &&
				midiEvent.event.controllerType == 64
			) {
				let currentSecond = Math.floor(totTime / 1000)
				if (!sustainsBySecond.hasOwnProperty(currentSecond)) {
					sustainsBySecond[currentSecond] = []
				}
				sustainsBySecond[currentSecond].push({
					timestamp: totTime,
					isOn: midiEvent.event.value > 64,
					value: midiEvent.event.value
				})
			}

			//keep track of completed beats to show beatLines
			generatedBeats +=
				Math.floor(ticksPerBeat * beatsToGenerate) / ticksPerBeat
			while (generatedBeats >= 1) {
				generatedBeats -= 1
				let beatTime = totTime - generatedBeats * secondsToGenerate * 1000
				let beatSecond = Math.floor(beatTime / 1000)
				if (!beatsBySecond.hasOwnProperty(beatSecond)) {
					beatsBySecond[beatSecond] = []
				}
				beatsBySecond[beatSecond].push(beatTime)
			}

			if (midiEvent.event.hasOwnProperty("channel")) {
				midiEvent.event.channelVolume = channels[midiEvent.event.channel].volume
			}
			midiEvent = getNextEvent()
			if (newBPM) {
				bpms.push({
					bpm: beatsPerMinute,
					timestamp: totTime
				})
			}
		} //end processNext

		if ((midiEvent = getNextEvent())) {
			while (midiEvent) processNext(true)
		}
		/*********
		 * </ADAPTED FROM JASMID>
		 *********/
		return { bpms, beatsBySecond, sustainsBySecond: sustainsBySecond }
	}
}

function getDefaultChannels() {
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
