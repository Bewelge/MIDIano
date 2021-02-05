import { hasBuffer, setBuffer } from "./audio/Buffers.js"
import { replaceAllString } from "./Util.js"
export class SoundfontLoader {
	constructor(audioCtx) {
		this.ctx = audioCtx
	}

	/**
	 *
	 * @param {String} instrument
	 */
	static async loadInstrument(instrument, soundfontName) {
		let baseUrl = "https://gleitz.github.io/midi-js-soundfonts/"
		if (instrument == "percussion") {
			soundfontName = "FluidR3_GM"
			baseUrl = ""
		}
		return fetch(baseUrl + soundfontName + "/" + instrument + "-ogg.js")
			.then(response => {
				if (response.ok) {
					return response.text()
				}
				throw Error(response.statusText)
			})
			.then(data => {
				let scr = document.createElement("script")
				scr.language = "javascript"
				scr.type = "text/javascript"
				let newData = replaceAllString(data, "Soundfont", soundfontName)
				scr.text = newData
				document.body.appendChild(scr)
			})
			.catch(function (error) {
				console.error("Error fetching soundfont: \n", error)
			})
	}
	static async loadInstruments(instruments) {
		console.log(instruments)
		return await Promise.all(
			instruments
				.slice(0)
				.map(instrument => SoundfontLoader.loadInstrument(instrument))
		)
	}
	static async getBuffers(ctx) {
		let sortedBuffers = null
		await SoundfontLoader.createBuffers(ctx).then(unsortedBuffers => {
			unsortedBuffers.forEach(noteBuffer =>
				setBuffer(
					noteBuffer.soundfontName,
					noteBuffer.instrument,
					noteBuffer.noteKey,
					noteBuffer.buffer
				)
			)
		})
		return sortedBuffers
	}
	static async createBuffers(ctx) {
		let promises = []
		for (let soundfontName in MIDI) {
			for (let instrument in MIDI[soundfontName]) {
				if (!hasBuffer(soundfontName, instrument)) {
					console.log(
						"Loaded '" + soundfontName + "' instrument : " + instrument
					)
					for (let noteKey in MIDI[soundfontName][instrument]) {
						let base64Buffer = SoundfontLoader.getBase64Buffer(
							MIDI[soundfontName][instrument][noteKey]
						)
						promises.push(
							SoundfontLoader.getNoteBuffer(
								ctx,
								base64Buffer,
								soundfontName,
								noteKey,
								instrument
							)
						)
					}
				}
			}
		}
		return await Promise.all(promises)
	}
	static async getNoteBuffer(
		ctx,
		base64Buffer,
		soundfontName,
		noteKey,
		instrument
	) {
		let audioBuffer
		return await ctx
			.decodeAudioData(base64Buffer, function (decodedBuffer) {
				audioBuffer = decodedBuffer
			})
			.then(() => {
				return {
					buffer: audioBuffer,
					noteKey: noteKey,
					instrument: instrument,
					soundfontName: soundfontName
				}
			})
	}
	static getBase64Buffer(str) {
		let base64 = str.split(",")[1]
		return Base64Binary.decodeArrayBuffer(base64)
	}
}
