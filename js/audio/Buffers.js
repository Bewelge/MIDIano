import { CONST } from "../CONST.js"

const buffers = {}
export const getBuffers = () => {
	return buffers
}
export const getBufferForNote = (soundfontName, instrument, midiNoteNumber) => {
	let key = CONST.NOTE_TO_KEY[midiNoteNumber]
	let buffer
	try {
		buffer = buffers[soundfontName][instrument][key]
	} catch (e) {
		console.error(e)
	}
	return buffer
}
export const hasBuffer = (soundfontName, instrument) =>
	buffers.hasOwnProperty(soundfontName) &&
	buffers[soundfontName].hasOwnProperty(instrument)

export const setBuffer = (
	soundfontName,
	instrument,
	midiNoteNumber,
	buffer
) => {
	if (!buffers.hasOwnProperty(soundfontName)) {
		buffers[soundfontName] = {}
	}
	if (!buffers[soundfontName].hasOwnProperty(instrument)) {
		buffers[soundfontName][instrument] = {}
	}
	buffers[soundfontName][instrument][midiNoteNumber] = buffer
}
