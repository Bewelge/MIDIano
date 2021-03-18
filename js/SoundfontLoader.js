import { hasBuffer, setBuffer } from "./audio/Buffers.js"
import { getLoader } from "./ui/Loader.js"
import { replaceAllString, iOS } from "./Util.js"
export class SoundfontLoader {
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
		let fileType = iOS ? "mp3" : "ogg"
		return fetch(
			baseUrl + soundfontName + "/" + instrument + "-" + fileType + ".js"
		)
			.then(response => {
				if (response.ok) {
					getLoader().setLoadMessage(
						"Loaded " + instrument + " from " + soundfontName + " soundfont."
					)
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
		return await Promise.all(
			instruments
				.slice(0)
				.map(instrument => SoundfontLoader.loadInstrument(instrument))
		)
	}
	static async getBuffers(ctx) {
		let sortedBuffers = null
		await SoundfontLoader.createBuffers(ctx).then(
			unsortedBuffers => {
				unsortedBuffers.forEach(noteBuffer => {
					setBuffer(
						noteBuffer.soundfontName,
						noteBuffer.instrument,
						noteBuffer.noteKey,
						noteBuffer.buffer
					)
				})
			},
			error => console.error(error)
		)
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
		let promise = new Promise((resolve, reject) => {
			ctx.decodeAudioData(
				base64Buffer,
				decodedBuffer => {
					resolve({
						buffer: decodedBuffer,
						noteKey: noteKey,
						instrument: instrument,
						soundfontName: soundfontName
					})
				},
				error => reject(error)
			)
		})
		return await promise

		//ios can't handle the promise based decodeAudioData
		// return await ctx
		// 	.decodeAudioData(base64Buffer, function (decodedBuffer) {
		// 		audioBuffer = decodedBuffer
		// 	})
		// 	.then(
		// 		() => {
		// 			return {
		// 				buffer: audioBuffer,
		// 				noteKey: noteKey,
		// 				instrument: instrument,
		// 				soundfontName: soundfontName
		// 			}
		// 		},
		// 		e => {
		// 			console.log(e)
		// 		}
		// 	)
	}
	static getBase64Buffer(str) {
		let base64 = str.split(",")[1]
		return Base64Binary.decodeArrayBuffer(base64)
	}
}
