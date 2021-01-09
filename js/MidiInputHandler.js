export class MidiInputHandler {
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
	isAnyInputSet() {
		let devices = this.getAvailableDevices()
		for (let i = 0; i < devices.length; i++) {
			if (this.isInputActive(devices[i])) {
				return true
			}
		}
		return false
	}
	getAvailableDevices() {
		return Array.from(this.midiAccess.inputs.values())
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
	clearInputs() {
		Array.from(this.midiAccess.inputs.values()).forEach(
			device => (device.onmidimessage = null)
		)
	}
	isInputActive(device) {
		return device.onmidimessage != null
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
					this.noteOnCallback(event.data[1])
					return
				}
			case 0x80:
				this.noteOffCallback(event.data[1])
				return
		}
	}
	noteOnCallback() {}
	noteOffCallback() {}
}
