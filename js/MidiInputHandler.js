class MidiInputHandler {
	constructor() {
		// patch up prefixes
		window.AudioContext = window.AudioContext || window.webkitAudioContext

		this.noMidiMessage =
			"You will only be able to play Midi-Files. To play along, you need to use a browser with Midi-support, connect a Midi-Device to your computer and reload the page."
		this.init()
	}
	init() {
		if (navigator.requestMIDIAccess)
			navigator
				.requestMIDIAccess()
				.then(this.onMIDIInit.bind(this), this.onMIDIReject.bind(this))
		else
			alert(
				"No MIDI support present in your browser.  Check https://developer.mozilla.org/en-US/docs/Web/API/MIDIAccess#Browser_compatibility to see which Browsers support this feature."
			)
	}
	getAvailableInputDevices() {
		try {
			return Array.from(this.midiAccess.inputs.values())
		} catch (e) {
			return []
		}
	}
	getAvailableOutputDevices() {
		try {
			return Array.from(this.midiAccess.outputs.values())
		} catch (e) {
			return []
		}
	}
	setNoteOnCallback(callback) {
		this.noteOnCallback = callback
	}
	addInput(device) {
		device.onmidimessage = this.MIDIMessageEventHandler.bind(this)
	}
	clearInput(device) {
		device.onmidimessage = null
	}
	addOutput(device) {
		this.activeOutput = device
	}
	clearOutput(device) {
		if (this.activeOutput == device) {
			this.activeOutput = null
		}
	}
	clearInputs() {
		Array.from(this.midiAccess.inputs.values()).forEach(
			device => (device.onmidimessage = null)
		)
	}
	isDeviceActive(device) {
		return device.onmidimessage != null
	}
	isOutputDeviceActive(device) {
		return this.activeOutput == device
	}
	onMIDIInit(midi) {
		this.midiAccess = midi
	}
	setNoteOffCallback(callback) {
		this.noteOffCallback = callback
	}
	onMIDIReject(err) {
		alert("The MIDI system failed to start. " + this.noMidiMessage)
	}

	MIDIMessageEventHandler(event) {
		// Mask off the lower nibble (MIDI channel, which we don't care about)
		switch (event.data[0] & 0xf0) {
			case 0x90:
				if (event.data[2] != 0) {
					// if velocity != 0 => note-on
					this.noteOnCallback(parseInt(event.data[1]) - 21)
					return
				}
			case 0x80:
				this.noteOffCallback(parseInt(event.data[1]) - 21)
				return
		}
	}
	getActiveMidiOutput() {
		return this.activeOutput
	}
	isOutputActive() {
		return this.activeOutput ? true : false
	}
	isInputActive() {
		let devices = this.getAvailableInputDevices()
		for (let i = 0; i < devices.length; i++) {
			if (this.isDeviceActive(devices[i])) {
				return true
			}
		}
		return false
	}
	playNote(noteNumber, velocity, noteOffVelocity, delayOn, delayOff) {
		let noteOnEvent = [0x90, noteNumber, velocity]
		let noteOffEvent = [0x80, noteNumber, noteOffVelocity]
		this.activeOutput.send(noteOnEvent, window.performance.now() + delayOn)
		this.activeOutput.send(noteOffEvent, window.performance.now() + delayOff)
	}
	midiOutNoteOff() {}
	noteOnCallback() {}
	noteOffCallback() {}
}
const theMidiHandler = new MidiInputHandler()
export const getMidiHandler = () => {
	return theMidiHandler
}
