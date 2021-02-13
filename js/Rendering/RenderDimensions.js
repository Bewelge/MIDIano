import { isBlack } from "../Util.js"
import { getSetting } from "../settings/Settings.js"

const MAX_NOTE_NUMBER = 87
const MIN_NOTE_NUMBER = 0

const MIN_WIDTH = 1040
const MIN_HEIGHT = 560

/**
 * Class to handle all the calculation of dimensions of the Notes & Keys on Screen-
 */
export class RenderDimensions {
	constructor() {
		window.addEventListener("resize", this.resize.bind(this))
		this.resizeCallbacks = []
		this.numberOfWhiteKeysShown = 52
		this.minNoteNumber = MIN_NOTE_NUMBER
		this.maxNoteNumber = MAX_NOTE_NUMBER
		this.menuHeight = 200
		this.resize()
	}
	/**
	 * Recompute all dimensions dependent on Screen Size
	 */
	resize() {
		this.windowWidth = Math.max(MIN_WIDTH, Math.floor(window.innerWidth))
		this.windowHeight = Math.floor(window.innerHeight)

		this.keyDimensions = {}
		this.computeKeyDimensions()
		this.resizeCallbacks.forEach(func => func())
	}
	registerResizeCallback(callback) {
		this.resizeCallbacks.push(callback)
	}

	/**
	 * Computes the key dimensions. Should be called on resize.
	 */
	computeKeyDimensions() {
		this.pianoPositionY = getSetting("pianoPosition")
		this.whiteKeyWidth = Math.max(
			20,
			this.windowWidth / this.numberOfWhiteKeysShown
		)

		this.whiteKeyHeight = Math.min(
			Math.floor(this.windowHeight * 0.2),
			this.whiteKeyWidth * 4.5
		)
		this.blackKeyWidth = Math.floor(this.whiteKeyWidth * 0.5829787234)
		this.blackKeyHeight = Math.floor((this.whiteKeyHeight * 2) / 3)
	}

	/**
	 * Returns the dimensions for the piano-key of the given note
	 *
	 * @param {Number} noteNumber
	 */
	getKeyDimensions(noteNumber) {
		if (!this.keyDimensions.hasOwnProperty(noteNumber)) {
			let isNoteBlack = isBlack(noteNumber)
			let x = this.getKeyX(noteNumber)

			this.keyDimensions[noteNumber] = {
				x: x,
				y: 0,
				w: isNoteBlack ? this.blackKeyWidth : this.whiteKeyWidth,
				h: isNoteBlack ? this.blackKeyHeight : this.whiteKeyHeight,
				black: isNoteBlack
			}
		}
		return this.keyDimensions[noteNumber]
	}
	getAbsolutePianoPosition() {
		return (
			this.windowHeight -
			this.whiteKeyHeight -
			Math.ceil(
				(parseInt(this.pianoPositionY) / 100) *
					(this.windowHeight - this.whiteKeyHeight - this.menuHeight)
			)
		)
	}

	/**
	 * Returns x-value  of the given Notenumber
	 *
	 * @param {Integer} noteNumber
	 */
	getKeyX(noteNumber) {
		return (
			(this.getWhiteKeyNumber(noteNumber) -
				this.getWhiteKeyNumber(this.minNoteNumber)) *
				this.whiteKeyWidth +
			(this.whiteKeyWidth - this.blackKeyWidth / 2) * isBlack(noteNumber)
		)
	}

	/**
	 * Returns the "white key index" of the note number. Ignores if the key itself is black
	 * @param {Number} noteNumber
	 */
	getWhiteKeyNumber(noteNumber) {
		return (
			noteNumber -
			Math.floor(Math.max(0, noteNumber + 11) / 12) -
			Math.floor(Math.max(0, noteNumber + 8) / 12) -
			Math.floor(Math.max(0, noteNumber + 6) / 12) -
			Math.floor(Math.max(0, noteNumber + 3) / 12) -
			Math.floor(Math.max(0, noteNumber + 1) / 12)
		)
	}

	/**
	 * Returns y value corresponding to the given time
	 *
	 * @param {Number} time
	 */
	getYForTime(time) {
		const height = this.windowHeight - this.whiteKeyHeight
		let noteToHeightConst = this.getNoteToHeightConst()
		if (time < 0) {
			noteToHeightConst /= getSetting("playedNoteFalloffSpeed")
		}
		return (
			height -
			(time / noteToHeightConst) * height -
			(this.windowHeight -
				this.whiteKeyHeight -
				this.getAbsolutePianoPosition())
		)
	}

	/**
     *Returns rendering x/y-location & size for the given note & time-info
     
	 * @param {Integer} noteNumber 
	 * @param {Number} currentTime
	 * @param {Number} noteStartTime
	 * @param {Number} noteEndTime
	 * @param {Number} sustainOffTime
	 */
	getNoteDimensions(
		noteNumber,
		currentTime,
		noteStartTime,
		noteEndTime,
		sustainOffTime
	) {
		const dur = noteEndTime - noteStartTime
		const keyBlack = isBlack(noteNumber)
		const x = this.getKeyX(noteNumber)

		let h =
			(dur / this.getNoteToHeightConst()) *
			(this.windowHeight - this.whiteKeyHeight)

		let hCorrection = 0
		let minNoteHeight = getSetting("minNoteHeight")
		if (h < minNoteHeight) {
			hCorrection = minNoteHeight - h
			h = minNoteHeight
		}
		let y = this.getYForTime(noteEndTime - currentTime)

		if (noteEndTime < currentTime) {
			y += this.whiteKeyHeight
		} else if (noteEndTime > currentTime && noteStartTime < currentTime) {
			h += this.whiteKeyHeight
		}

		let sustainY = 0
		let sustainH = 0
		if (sustainOffTime > noteEndTime) {
			sustainH =
				((sustainOffTime - noteEndTime) / this.getNoteToHeightConst()) *
				(this.windowHeight - this.whiteKeyHeight)
			sustainY = this.getYForTime(sustainOffTime - currentTime)
		}

		return {
			x: x,
			y: y - hCorrection + 1,
			w: keyBlack ? this.blackKeyWidth : this.whiteKeyWidth,
			h: h - 2,
			sustainH: sustainH,
			sustainY: sustainY,
			black: keyBlack
		}
	}

	getNoteToHeightConst() {
		return getSetting("noteToHeightConst") * this.windowHeight
	}

	getSecondsDisplayedBefore() {
		let pianoPos = getSetting("pianoPosition") / 100
		return Math.ceil(((1 - pianoPos) * this.getNoteToHeightConst()) / 1000)
	}
	getSecondsDisplayedAfter() {
		let pianoPos = getSetting("pianoPosition") / 100
		return Math.floor(
			(pianoPos *
				(this.getNoteToHeightConst() / getSetting("playedNoteFalloffSpeed"))) /
				1000
		)
	}

	//ZOOM
	showAll() {
		this.setZoom(MIN_NOTE_NUMBER, MAX_NOTE_NUMBER)
	}
	fitSong(range) {
		while (
			isBlack(range.min - MIN_NOTE_NUMBER) &&
			range.min > MIN_NOTE_NUMBER
		) {
			range.min--
		}
		while (
			isBlack(range.max - MIN_NOTE_NUMBER) &&
			range.max < MAX_NOTE_NUMBER
		) {
			range.max++
		}
		this.setZoom(range.min, range.max)
	}
	zoomIn() {
		this.minNoteNumber++
		this.maxNoteNumber--
		while (
			isBlack(this.minNoteNumber - MIN_NOTE_NUMBER) &&
			this.minNoteNumber < this.maxNoteNumber
		) {
			this.minNoteNumber++
		}
		while (
			isBlack(this.maxNoteNumber - MIN_NOTE_NUMBER) &&
			this.maxNoteNumber > this.minNoteNumber
		) {
			this.maxNoteNumber--
		}
		this.setZoom(this.minNoteNumber, this.maxNoteNumber)
	}
	zoomOut() {
		this.minNoteNumber--
		this.maxNoteNumber++
		while (
			isBlack(this.minNoteNumber - MIN_NOTE_NUMBER) &&
			this.minNoteNumber > MIN_NOTE_NUMBER
		) {
			this.minNoteNumber--
		}
		while (
			isBlack(this.maxNoteNumber - MIN_NOTE_NUMBER) &&
			this.maxNoteNumber < MAX_NOTE_NUMBER
		) {
			this.maxNoteNumber++
		}
		this.setZoom(
			Math.max(MIN_NOTE_NUMBER, this.minNoteNumber),
			Math.min(MAX_NOTE_NUMBER, this.maxNoteNumber)
		)
	}
	moveViewLeft() {
		if (this.minNoteNumber == MIN_NOTE_NUMBER) return
		this.minNoteNumber--
		this.maxNoteNumber--
		while (
			isBlack(this.minNoteNumber - MIN_NOTE_NUMBER) &&
			this.minNoteNumber > MIN_NOTE_NUMBER
		) {
			this.minNoteNumber--
		}
		while (isBlack(this.maxNoteNumber - MIN_NOTE_NUMBER)) {
			this.maxNoteNumber--
		}
		this.setZoom(
			Math.max(MIN_NOTE_NUMBER, this.minNoteNumber),
			this.maxNoteNumber
		)
	}
	moveViewRight() {
		if (this.maxNoteNumber == MAX_NOTE_NUMBER) return
		this.minNoteNumber++
		this.maxNoteNumber++
		while (isBlack(this.minNoteNumber - MIN_NOTE_NUMBER)) {
			this.minNoteNumber++
		}
		while (
			isBlack(this.maxNoteNumber - MIN_NOTE_NUMBER) &&
			this.maxNoteNumber < MAX_NOTE_NUMBER
		) {
			this.maxNoteNumber++
		}

		this.setZoom(
			this.minNoteNumber,
			Math.min(MAX_NOTE_NUMBER, this.maxNoteNumber)
		)
	}

	/**
	 *
	 * @param {Number} minNoteNumber
	 * @param {Number} maxNoteNumber
	 */
	setZoom(minNoteNumber, maxNoteNumber) {
		let numOfWhiteKeysInRange = 0
		for (let i = minNoteNumber; i <= maxNoteNumber; i++) {
			numOfWhiteKeysInRange += isBlack(i - MIN_NOTE_NUMBER) ? 0 : 1
		}
		console.log(minNoteNumber, maxNoteNumber)
		this.minNoteNumber = minNoteNumber
		this.maxNoteNumber = maxNoteNumber
		this.numberOfWhiteKeysShown = numOfWhiteKeysInRange

		this.resize()
	}
}
