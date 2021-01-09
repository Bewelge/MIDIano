export class SoundfontLoader {
	constructor(audioCtx) {
		this.buffers = {}
		this.ctx = audioCtx
	}

	/**
	 *
	 * @param {String} instrument
	 */
	static async loadInstrument(instrument, soundfontName) {
		if (instrument == "percussion") {
			soundfontName = "FluidR3_GM"
		}
		return fetch(
			"https://gleitz.github.io/midi-js-soundfonts/" +
				soundfontName +
				"/" +
				instrument +
				"-ogg.js"
		)
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
				let newData = data.replaceAll("Soundfont", soundfontName)
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
	static async getBuffers(ctx, soundfontName) {
		let sortedBuffers = null
		let unsortedBuffers = await SoundfontLoader.createBuffers(
			ctx,
			soundfontName
		).then(unsortedBuffers => {
			let buffers = {}
			for (let b in unsortedBuffers) {
				let buffer = unsortedBuffers[b]
				if (!buffers.hasOwnProperty(buffer.instrument)) {
					buffers[buffer.instrument] = {}
				}
				buffers[buffer.instrument][buffer.note] = buffer.buffer
			}
			sortedBuffers = buffers
		})
		return sortedBuffers
	}
	static async createBuffers(ctx, soundfontName) {
		let promises = []
		for (let instrument in MIDI[soundfontName]) {
			console.log("Loaded instrument : " + instrument)
			for (let note in MIDI[soundfontName][instrument]) {
				let base64Buffer = SoundfontLoader.getBase64Buffer(
					MIDI[soundfontName][instrument][note]
				)
				promises.push(
					SoundfontLoader.getNotePromise(ctx, base64Buffer, note, instrument)
				)
			}
		}
		return await Promise.all(promises)
	}
	static async getNotePromise(ctx, base64Buffer, note, instrument) {
		let audioBuffer
		return await ctx
			.decodeAudioData(base64Buffer, function (decodedBuffer) {
				audioBuffer = decodedBuffer
			})
			.then(() => {
				return {
					buffer: audioBuffer,
					note: note,
					instrument: instrument
				}
			})
	}
	static getBase64Buffer(str) {
		let base64 = str.split(",")[1]
		return Base64Binary.decodeArrayBuffer(base64)
	}
}
