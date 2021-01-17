import { isBlack } from "../Util.js"

/**
 * Class to handle all the calculation of dimensions of the Notes & Keys on Screen-
 */
export class RenderDimensions {
	constructor() {
		window.addEventListener("resize", this.resize.bind(this))
		this.resizeCallbacks = []
		this.resize()
	}
	/**
	 * Recompute all dimensions dependent on Screen Size
	 */
	resize() {
		this.windowWidth = Math.max(1040, Math.floor(window.innerWidth))
		this.windowHeight = Math.floor(window.innerHeight)
		this.noteToHeightConst = this.windowHeight * 3

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
		this.whiteKeyWidth = Math.max(20, this.windowWidth / 52)
		this.whiteKeyHeight = this.whiteKeyWidth * 4.5
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
			let x = this.getKeyX(noteNumber, isNoteBlack)

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

	/**
	 * Returns x-value  of the given Notenumber
	 *
	 * @param {Integer} noteNumber
	 * @param {boolean} isNoteBlack
	 */
	getKeyX(noteNumber) {
		return (
			(noteNumber -
				Math.floor(Math.max(0, noteNumber + 11) / 12) -
				Math.floor(Math.max(0, noteNumber + 8) / 12) -
				Math.floor(Math.max(0, noteNumber + 6) / 12) -
				Math.floor(Math.max(0, noteNumber + 3) / 12) -
				Math.floor(Math.max(0, noteNumber + 1) / 12)) *
				this.whiteKeyWidth +
			(this.whiteKeyWidth - this.blackKeyWidth / 2) * isBlack(noteNumber)
		)
	}

	/**
	 * Returns y value corresponding to the given time
	 *
	 * @param {Number} time
	 */
	getYForTime(time) {
		const height = this.windowHeight - this.whiteKeyHeight
		return height - (time / this.noteToHeightConst) * height
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
		noteNumber -= 21

		const dur = noteEndTime - noteStartTime
		const keyBlack = isBlack(noteNumber)
		const x = this.getKeyX(noteNumber, keyBlack)

		const h =
			(dur / this.noteToHeightConst) * (this.windowHeight - this.whiteKeyHeight)
		const y = this.getYForTime(noteEndTime - currentTime)

		let sustainY = 0
		let sustainH = 0
		if (sustainOffTime > noteEndTime) {
			sustainH =
				((sustainOffTime - noteStartTime) / this.noteToHeightConst) *
				(this.windowHeight - this.whiteKeyHeight)
			sustainY = this.getYForTime(sustainOffTime - currentTime)
		}

		return {
			x: x,
			y: y + 1,
			w: keyBlack ? this.blackKeyWidth : this.whiteKeyWidth,
			h: h - 2,
			sustainH: sustainH,
			sustainY: sustainY,
			black: keyBlack
		}
	}
}
