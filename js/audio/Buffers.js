import { CONST } from "../data/CONST.js"

const buffers = {}
export const getBuffers = () => {
	return buffers
}
export const getBufferForNote = (soundfontName, instrument, noteNumber) => {
	let noteKey = CONST.MIDI_NOTE_TO_KEY[noteNumber + 21]
	let buffer
	if (instrument == "percussion") {
		soundfontName = "FluidR3_GM"
	}
	try {
		buffer = buffers[soundfontName][instrument][noteKey]
	} catch (e) {
		console.error(e)
	}
	return buffer
}
export const hasBuffer = (soundfontName, instrument) =>
	buffers.hasOwnProperty(soundfontName) &&
	buffers[soundfontName].hasOwnProperty(instrument)

export const setBuffer = (soundfontName, instrument, noteKey, buffer) => {
	if (!buffers.hasOwnProperty(soundfontName)) {
		buffers[soundfontName] = {}
	}
	if (!buffers[soundfontName].hasOwnProperty(instrument)) {
		buffers[soundfontName][instrument] = {}
	}
	buffers[soundfontName][instrument][noteKey] = buffer
}
