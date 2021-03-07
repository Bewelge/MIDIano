class MicInputHandler {
	constructor() {
		if (navigator.mediaDevices === undefined) {
			navigator.mediaDevices = {}
		}

		if (navigator.mediaDevices.getUserMedia === undefined) {
			navigator.mediaDevices.getUserMedia = function (constraints) {
				// First get ahold of the legacy getUserMedia, if present
				var getUserMedia =
					navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia

				// Some browsers just don't implement it - return a rejected promise with an error
				// to keep a consistent interface
				if (!getUserMedia) {
					return Promise.reject(
						new Error("getUserMedia is not implemented in this browser")
					)
				}

				// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
				return new Promise(function (resolve, reject) {
					getUserMedia.call(navigator, constraints, resolve, reject)
				})
			}
		}
		this.frequencies = {}
		this.lastStrongestFrequency = 0
		let audioContext = new (window.AudioContext || window.webkitAudioContext)({
			sampleRate: 8000
		})
		var source
		var analyser = audioContext.createAnalyser()
		analyser.minDecibels = -90
		analyser.maxDecibels = -10
		analyser.smoothingTimeConstant = 0.5
		this.audioContext = audioContext
		this.analyser = analyser

		if (navigator.mediaDevices.getUserMedia) {
			console.log("getUserMedia supported.")
			var constraints = { audio: true }
			navigator.mediaDevices
				.getUserMedia(constraints)
				.then(
					function (stream) {
						source = audioContext.createMediaStreamSource(stream)
						// source.connect(audioContext.destination)
						source.connect(analyser)

						// this.getCurrentFrequency()
					}.bind(this)
				)
				.catch(function (err) {
					console.log("The following gUM error occured: " + err)
				})
		}
	}
	getCurrentFrequency() {
		this.analyser.fftSize = 2048
		var bufferLength = this.analyser.fftSize
		var dataArray = new Float32Array(bufferLength)
		this.analyser.getFloatTimeDomainData(dataArray)
		return this.autoCorrelate(dataArray, this.audioContext.sampleRate)

		// var dataArray = new Uint8Array(bufferLength)
		// this.analyser.getByteFrequencyData(dataArray)
		// let maxIndex = 0
		// let max = -Infinity
		// let tot = dataArray.reduce((a, b) => a + b, 0)
		// let weightedFrequency = 0
		// let strongestFrequency = 0
		// let sampleRate = this.audioContext.sampleRate
		// dataArray.forEach((value, index) => {
		// 	if (value > max && value > 50) {
		// 		max = value
		// 		maxIndex = index

		// 		strongestFrequency = (sampleRate / 2) * (index / bufferLength)

		// 		if (index > 0 && index < bufferLength) {
		// 			let nextFreq = (sampleRate / 2) * ((index + 1) / bufferLength)
		// 			let nextVal = dataArray[index + 1]
		// 			let nextDiff = Math.abs(nextVal - value)

		// 			let prevFreq = (sampleRate / 2) * ((index - 1) / bufferLength)
		// 			let prevVal = dataArray[index - 1]
		// 			let prevDiff = Math.abs(prevVal - value)

		// 			let totVals = value + prevVal + nextVal
		// 			let totDiff = nextDiff + prevDiff

		// 			strongestFrequency =
		// 				(strongestFrequency * value) / totVals +
		// 				(nextVal / totVals) * nextFreq +
		// 				(prevVal / totVals) * prevFreq
		// 		}
		// 	}
		// 	weightedFrequency +=
		// 		(value / tot) * (sampleRate / 2) * (index / bufferLength)
		// })
		// if (max > 0) {
		// 	console.log(strongestFrequency)
		// }
		// return strongestFrequency
	}
	autoCorrelate(buf, sampleRate) {
		// Implements the ACF2+ algorithm
		var SIZE = buf.length
		var rms = 0

		for (var i = 0; i < SIZE; i++) {
			var val = buf[i]
			rms += val * val
		}
		rms = Math.sqrt(rms / SIZE)
		if (rms < 0.01)
			// not enough signal
			return -1

		var r1 = 0,
			r2 = SIZE - 1,
			thres = 0.2
		for (var i = 0; i < SIZE / 2; i++)
			if (Math.abs(buf[i]) < thres) {
				r1 = i
				break
			}
		for (var i = 1; i < SIZE / 2; i++)
			if (Math.abs(buf[SIZE - i]) < thres) {
				r2 = SIZE - i
				break
			}

		buf = buf.slice(r1, r2)
		SIZE = buf.length

		var c = new Array(SIZE).fill(0)
		for (var i = 0; i < SIZE; i++)
			for (var j = 0; j < SIZE - i; j++) c[i] = c[i] + buf[j] * buf[j + i]

		var d = 0
		while (c[d] > c[d + 1]) d++
		var maxval = -1,
			maxpos = -1
		for (var i = d; i < SIZE; i++) {
			if (c[i] > maxval) {
				maxval = c[i]
				maxpos = i
			}
		}
		var T0 = maxpos

		var x1 = c[T0 - 1],
			x2 = c[T0],
			x3 = c[T0 + 1]
		let a = (x1 + x3 - 2 * x2) / 2
		let b = (x3 - x1) / 2
		if (a) T0 = T0 - b / (2 * a)

		return sampleRate / T0
	}
	frequencyToNote(frequency) {
		let note = 12 * (Math.log(frequency / 440) / Math.log(2))
		return Math.round(note) + 48
	}

	setupUserMedia() {
		if (navigator.mediaDevices === undefined) {
			navigator.mediaDevices = {}
		}

		if (navigator.mediaDevices.getUserMedia === undefined) {
			navigator.mediaDevices.getUserMedia = function (constraints) {
				// First get ahold of the legacy getUserMedia, if present
				var getUserMedia =
					navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia

				// Some browsers just don't implement it - return a rejected promise with an error
				// to keep a consistent interface
				if (!getUserMedia) {
					return Promise.reject(
						new Error("getUserMedia is not implemented in this browser")
					)
				}

				// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
				return new Promise(function (resolve, reject) {
					getUserMedia.call(navigator, constraints, resolve, reject)
				})
			}
		}
	}
}

var theMicInputHandler = null // new MicInputHandler()

export const getMicInputHandler = () => {
	return theMicInputHandler
}
export const getCurrentMicFrequency = () => {
	if (!theMicInputHandler) return -1
	return theMicInputHandler.getCurrentFrequency()
}

export const getCurrentMicNote = () => {
	if (!theMicInputHandler) return -1
	return theMidInputHandler.frequencyToNote(
		theMicInputHandler.getCurrentFrequency()
	)
}
