export class MidiInputHandler {
	constructor() {
		// patch up prefixes
		window.AudioContext = window.AudioContext || window.webkitAudioContext

		if (navigator.requestMIDIAccess)
			navigator
				.requestMIDIAccess()
				.then(this.onMIDIInit.bind(this), this.onMIDIReject.bind(this))
		else
			alert(
				"No MIDI support present in your browser.  You're gonna have a bad time."
			)
	}
	setNoteOnCallback(callback) {
		this.noteOnCallback = callback
	}
	setNoteOffCallback(callback) {
		this.noteOffCallback = callback
	}
	onMIDIReject(err) {
		alert("The MIDI system failed to start.  You're gonna have a bad time.")
	}
	noteOnCallback() {}
	noteOffCallback() {}

	MIDIMessageEventHandler(event) {
		// Mask off the lower nibble (MIDI channel, which we don't care about)
		switch (event.data[0] & 0xf0) {
			case 0x90:
				if (event.data[2] != 0) {
					// if velocity != 0, this is a note-on message
					this.noteOnCallback(event.data[1])
					return
				}
			// if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
			case 0x80:
				this.noteOffCallback(event.data[1])
				return
		}
	}
	onMIDIInit(midi) {
		this.midiAccess = midi
		console.log(123)
		var haveAtLeastOneDevice = false
		var inputs = this.midiAccess.inputs.values()
		console.log(inputs)
		for (
			var input = inputs.next();
			input && !input.done;
			input = inputs.next()
		) {
			input.value.onmidimessage = this.MIDIMessageEventHandler.bind(this)
			haveAtLeastOneDevice = true
		}
		if (!haveAtLeastOneDevice)
			alert("No MIDI input devices present.  You're gonna have a bad time.")
	}
}
