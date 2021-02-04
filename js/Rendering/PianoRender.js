import { CONST } from "../CONST.js"
import { DomHelper } from "../DomHelper.js"
import { getSetting } from "../settings/Settings.js"
import { isBlack, replaceAllString } from "../Util.js"
/**
 * Class to render the piano (and the colored keys played on the piano)
 */
export class PianoRender {
	constructor(renderDimensions) {
		this.renderDimensions = renderDimensions
		this.resize()
		this.renderDimensions.registerResizeCallback(this.resize.bind(this))
		this.clickCallback = null
		this.setClickCallback(num => console.log(num))
	}
	/**
	 * Resize canvases and redraw piano.
	 */
	resize() {
		this.resizeCanvases()
		this.drawPiano(this.ctxWhite, this.ctxBlack)
	}
	/**
	 * pass listeners that are called with the note number as argument when piano canvas is clicked.
	 * @param {Function} onNoteOn
	 * @param {Function} onNoteOff
	 */
	setPianoInputListeners(onNoteOn, onNoteOff) {
		this.onNoteOn = onNoteOn
		this.onNoteOff = onNoteOff
	}
	/**
	 * Register a callback to trigger when user clicks the piano Canvas. Callback is called with
	 */
	setClickCallback(callback) {
		this.clickCallback = callback
	}
	/**
	 * Resizes all piano canvases.
	 */
	resizeCanvases() {
		DomHelper.setCanvasSize(
			this.getPianoCanvasWhite(),
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight
		)
		this.getPianoCanvasWhite().style.top =
			this.renderDimensions.windowHeight -
			this.renderDimensions.whiteKeyHeight +
			"px"

		DomHelper.setCanvasSize(
			this.getPlayedKeysWhite(),
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight
		)
		this.getPlayedKeysWhite().style.top =
			this.renderDimensions.windowHeight -
			this.renderDimensions.whiteKeyHeight +
			"px"

		DomHelper.setCanvasSize(
			this.getPianoCanvasBlack(),
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight
		)
		this.getPianoCanvasBlack().style.top =
			this.renderDimensions.windowHeight -
			this.renderDimensions.whiteKeyHeight +
			"px"

		DomHelper.setCanvasSize(
			this.getPlayedKeysBlack(),
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight
		)
		this.getPlayedKeysBlack().style.top =
			this.renderDimensions.windowHeight -
			this.renderDimensions.whiteKeyHeight +
			"px"
	}
	/**
	 *
	 * @param {Integer} midiNoteNumber
	 */
	drawActiveInputKey(midiNoteNumber) {
		let dim = this.renderDimensions.getKeyDimensions(midiNoteNumber - 21)
		let keyBlack = isBlack(midiNoteNumber - 21)
		let ctx = keyBlack ? this.playedKeysCtxBlack : this.playedKeysCtxWhite
		const activeInputColor = "rgba(40,155,155,0.8)"
		if (keyBlack) {
			this.drawBlackKey(ctx, dim, activeInputColor, true)
		} else {
			this.drawWhiteKey(ctx, dim, activeInputColor, true)
		}
	}

	drawActiveKey(renderInfo, color) {
		let dim = this.renderDimensions.getKeyDimensions(renderInfo.noteNumber - 21)
		let keyBlack = renderInfo.keyBlack
		let ctx = keyBlack ? this.playedKeysCtxBlack : this.playedKeysCtxWhite

		ctx.fillStyle = color
		if (keyBlack) {
			this.drawBlackKey(ctx, dim, color)
		} else {
			this.drawWhiteKey(ctx, dim, color)
		}
	}

	clearPlayedKeysCanvases() {
		this.playedKeysCtxWhite.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight
		)
		this.playedKeysCtxBlack.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight
		)
	}

	drawPiano(ctxWhite, ctxBlack) {
		ctxWhite.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight
		)
		ctxBlack.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight
		)
		//Background
		ctxWhite.fillStyle = "rgba(0,0,0,1)"
		ctxWhite.fillRect(
			0,
			5,
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight + 10
		)

		this.drawWhiteKeys(ctxWhite)
		if (getSetting("showKeyNamesOnPianoWhite")) {
			this.drawWhiteKeyNames(ctxWhite)
		}
		this.drawBlackKeys(ctxBlack)
		if (getSetting("showKeyNamesOnPianoBlack")) {
			this.drawBlackKeyNames(ctxBlack)
		}

		//velvet
		ctxWhite.strokeStyle = "rgba(155,50,50,1)"
		ctxWhite.shadowColor = "rgba(155,50,50,1)"
		ctxWhite.shadowOffsetY = 2
		ctxWhite.shadowBlur = 2
		ctxWhite.lineWidth = 4
		ctxWhite.beginPath()
		ctxWhite.moveTo(this.renderDimensions.windowWidth, 2)
		ctxWhite.lineTo(0, 2)
		ctxWhite.closePath()
		ctxWhite.stroke()
		ctxWhite.shadowColor = "rgba(0,0,0,0)"
		ctxWhite.shadowBlur = 0
	}

	drawWhiteKeys(ctxWhite) {
		for (
			let i = this.renderDimensions.minNoteNumber - 21;
			i <= this.renderDimensions.maxNoteNumber - 21;
			i++
		) {
			let dims = this.renderDimensions.getKeyDimensions(i)
			if (!isBlack(i)) {
				this.drawWhiteKey(ctxWhite, dims, "rgba(255,255,255,1)")
			}
		}
	}

	drawBlackKeys(ctxBlack) {
		for (
			let i = this.renderDimensions.minNoteNumber - 21;
			i <= this.renderDimensions.maxNoteNumber - 21;
			i++
		) {
			let dims = this.renderDimensions.getKeyDimensions(i)
			if (isBlack(i)) {
				this.drawBlackKey(ctxBlack, dims)
			}
		}
	}
	drawWhiteKeyNames(ctx) {
		ctx.fillStyle = "black"
		const fontSize = this.renderDimensions.whiteKeyWidth / 2
		ctx.font = fontSize + "px Arial black"
		for (
			let i = this.renderDimensions.minNoteNumber - 21;
			i <= this.renderDimensions.maxNoteNumber - 21;
			i++
		) {
			let dims = this.renderDimensions.getKeyDimensions(i)
			if (!isBlack(i)) {
				let txt = this.getDisplayKey(CONST.NOTE_TO_KEY[i + 21])
				let txtWd = ctx.measureText(txt).width
				ctx.fillText(
					txt,
					dims.x + dims.w / 2 - txtWd / 2,
					this.renderDimensions.whiteKeyHeight - fontSize / 3
				)
			}
		}
	}
	drawBlackKeyNames(ctx) {
		ctx.fillStyle = "white"
		const fontSize = this.renderDimensions.blackKeyWidth / 2.1
		ctx.font = Math.ceil(fontSize) + "px Arial black"
		for (
			let i = this.renderDimensions.minNoteNumber - 21;
			i <= this.renderDimensions.maxNoteNumber - 21;
			i++
		) {
			let dims = this.renderDimensions.getKeyDimensions(i)
			if (isBlack(i)) {
				let txt = this.getDisplayKey(CONST.NOTE_TO_KEY[i + 21])
				let txtWd = ctx.measureText(txt).width
				ctx.fillText(
					txt,
					dims.x + dims.w / 2 - txtWd / 2,
					this.renderDimensions.blackKeyHeight - 2
				)
			}
		}
	}
	getDisplayKey(key) {
		let blackToHash = replaceAllString(key, "b", "#")
		return blackToHash.replace(/[0-9]/g, "")
	}
	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Dimensions} dims
	 */
	drawWhiteKey(ctx, dims, color, isActive) {
		let radius = 4
		let x = dims.x
		let y = dims.y - 2 + isActive ? 6 : 0
		let height = dims.h
		let width = dims.w

		let whiteKeyHeight = this.renderDimensions.whiteKeyHeight

		ctx.beginPath()
		ctx.moveTo(x + 1, y)
		ctx.lineTo(x - 1 + width, y)
		ctx.lineTo(x - 1 + width, y + height - radius)
		ctx.lineTo(x - 1 + width - radius, y + height)
		ctx.lineTo(x + 1 + radius, y + height)
		ctx.lineTo(x + 1, y + height - radius)
		ctx.lineTo(x + 1, y)

		ctx.fillStyle = color
		ctx.fill()

		// let rgr = ctx.createLinearGradient(
		// 	x,
		// 	whiteKeyHeight / 2,
		// 	x + width,
		// 	whiteKeyHeight / 2
		// )
		// rgr.addColorStop(0.9, "rgba(0,0,0,0.1)")
		// rgr.addColorStop(0.5, "rgba(0,0,0,0)")
		// rgr.addColorStop(0.1, "rgba(0,0,0,0.1)")
		// ctx.fillStyle = rgr
		// ctx.fill()

		let rgr2 = ctx.createLinearGradient(
			this.renderDimensions.windowWidth / 2,
			0,
			this.renderDimensions.windowWidth / 2,
			whiteKeyHeight
		)
		rgr2.addColorStop(0, "rgba(0,0,0,0.9)")
		rgr2.addColorStop(1, "rgba(255,255,255,0.5)")
		ctx.fillStyle = rgr2
		ctx.fill()

		ctx.closePath()
	}
	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Dimensions} dims
	 */
	drawBlackKey(ctx, dims, color) {
		let radius = 2
		let x = dims.x
		let y = dims.y + 3.5
		let height = dims.h
		let width = dims.w
		color = color || "black"

		ctx.beginPath()
		ctx.moveTo(x + 1, y + radius)
		ctx.lineTo(x + 1 + (width * 1) / 8, y)
		ctx.lineTo(x - 1 + (width * 7) / 8, y)
		ctx.lineTo(x - 1 + width, y + radius)
		ctx.lineTo(x - 1 + width, y + height - radius)
		ctx.lineTo(x - 1 + width - radius, y + height)
		ctx.lineTo(x + 1 + radius, y + height)
		ctx.lineTo(x + 1, y + height - radius)
		ctx.lineTo(x + 1, y)

		ctx.fillStyle = color
		ctx.fill()
		ctx.closePath()
	}

	getPianoCanvasWhite() {
		if (!this.pianoCanvasWhite) {
			this.pianoCanvasWhite = DomHelper.createCanvas(
				this.renderDimensions.windowWidth,
				this.renderDimensions.whiteKeyHeight,
				{
					position: "absolute",
					left: "0px",
					zIndex: 99
				}
			)
			this.pianoCanvasWhite.className = "pianoCanvas"
			document.body.appendChild(this.pianoCanvasWhite)
			this.ctxWhite = this.pianoCanvasWhite.getContext("2d")
		}
		return this.pianoCanvasWhite
	}
	getPlayedKeysWhite() {
		if (!this.playedKeysCanvasWhite) {
			this.playedKeysCanvasWhite = DomHelper.createCanvas(
				this.renderDimensions.windowWidth,
				this.renderDimensions.whiteKeyHeight,
				{
					position: "absolute",
					left: "0px",
					zIndex: 99
				}
			)
			this.playedKeysCanvasWhite.className = "pianoCanvas"
			document.body.appendChild(this.playedKeysCanvasWhite)
			this.playedKeysCtxWhite = this.playedKeysCanvasWhite.getContext("2d")
		}
		return this.playedKeysCanvasWhite
	}
	getPianoCanvasBlack() {
		if (!this.pianoCanvasBlack) {
			this.pianoCanvasBlack = DomHelper.createCanvas(
				this.renderDimensions.windowWidth,
				this.renderDimensions.whiteKeyHeight,
				{
					position: "absolute",
					left: "0px",
					zIndex: 99,
					boxShadow: "0px -3px 15px 5px rgba(0,0,0,0.4)"
				}
			)
			this.pianoCanvasBlack.className = "pianoCanvas"
			document.body.appendChild(this.pianoCanvasBlack)
			this.ctxBlack = this.pianoCanvasBlack.getContext("2d")
		}
		return this.pianoCanvasBlack
	}
	getPlayedKeysBlack() {
		if (!this.playedKeysCanvasBlack) {
			this.playedKeysCanvasBlack = DomHelper.createCanvas(
				this.renderDimensions.windowWidth,
				this.renderDimensions.whiteKeyHeight,
				{
					position: "absolute",
					left: "0px",
					zIndex: 99
				}
			)
			this.playedKeysCanvasBlack.className = "pianoCanvas"
			document.body.appendChild(this.playedKeysCanvasBlack)
			this.playedKeysCtxBlack = this.playedKeysCanvasBlack.getContext("2d")

			this.playedKeysCanvasBlack.addEventListener(
				"mousedown",
				this.onPianoMousedown.bind(this)
			)
			this.playedKeysCanvasBlack.addEventListener(
				"mouseup",
				this.onPianoMouseup.bind(this)
			)
			this.playedKeysCanvasBlack.addEventListener(
				"mousemove",
				this.onPianoMousemove.bind(this)
			)
			this.playedKeysCanvasBlack.addEventListener(
				"mouseleave",
				this.onPianoMouseleave.bind(this)
			)
		}
		return this.playedKeysCanvasBlack
	}
	onPianoMousedown(ev) {
		if (getSetting("clickablePiano")) {
			let { x, y } = this.getCanvasPosFromMouseEvent(ev)
			let keyUnderMouse = this.getKeyAtPos(x, y)
			if (keyUnderMouse >= 0) {
				this.currentKeyUnderMouse = keyUnderMouse
				this.isMouseDown = true
				this.onNoteOn(keyUnderMouse + 21)
			} else {
				this.clearCurrentKeyUnderMouse()
			}
		}
	}

	onPianoMouseup(ev) {
		this.isMouseDown = false
		this.clearCurrentKeyUnderMouse()
	}
	onPianoMouseleave(ev) {
		this.isMouseDown = false
		this.clearCurrentKeyUnderMouse()
	}

	onPianoMousemove(ev) {
		if (getSetting("clickablePiano")) {
			let { x, y } = this.getCanvasPosFromMouseEvent(ev)
			let keyUnderMouse = this.getKeyAtPos(x, y)
			if (this.isMouseDown && keyUnderMouse >= 0) {
				if (this.currentKeyUnderMouse != keyUnderMouse) {
					this.onNoteOff(this.currentKeyUnderMouse + 21)
					this.onNoteOn(keyUnderMouse + 21)
					this.currentKeyUnderMouse = keyUnderMouse
				}
			} else {
				this.clearCurrentKeyUnderMouse()
			}
		}
	}
	clearCurrentKeyUnderMouse() {
		if (this.currentKeyUnderMouse >= 0) {
			this.onNoteOff(this.currentKeyUnderMouse + 21)
		}
		this.currentKeyUnderMouse = -1
	}
	getKeyAtPos(x, y) {
		let clickedKey = -1
		for (let i = 0; i <= 87; i++) {
			let dims = this.renderDimensions.getKeyDimensions(i)
			if (x > dims.x && x < dims.x + dims.w) {
				if (y > dims.y && y < dims.y + dims.h) {
					if (clickedKey == -1) {
						clickedKey = i
					} else if (isBlack(i) && !isBlack(clickedKey)) {
						clickedKey = i
						break
					}
				}
			}
		}
		return clickedKey
	}
	getCanvasPosFromMouseEvent(ev) {
		let x = ev.clientX
		let y =
			ev.clientY -
			(this.renderDimensions.windowHeight -
				this.renderDimensions.whiteKeyHeight)
		return { x, y }
	}
}
