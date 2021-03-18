import { CONST } from "../data/CONST.js"
import { DomHelper } from "../ui/DomHelper.js"
import { getSetting } from "../settings/Settings.js"
import { isBlack, replaceAllString } from "../Util.js"
/**
 * Class to render the piano (and the colored keys played on the piano)
 */
export class PianoRender {
	constructor(renderDimensions) {
		this.renderDimensions = renderDimensions
		this.renderDimensions.registerResizeCallback(this.resize.bind(this))
		this.clickCallback = null
		this.blackKeyImg = new Image()
		this.blackKeyImg.src = "../../blackKey.svg"
		this.blackKeyImg.onload
		this.positionY = 50 //from bottom

		this.resize()
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
	getAllCanvases() {
		return [
			this.getPianoCanvasWhite(),
			this.getPlayedKeysWhite(),
			this.getPianoCanvasBlack(),
			this.getPlayedKeysBlack()
		]
	}

	/**
	 * Resizes all piano canvases.
	 */
	resizeCanvases() {
		this.getAllCanvases().forEach(canvas => {
			DomHelper.setCanvasSize(
				canvas,
				this.renderDimensions.windowWidth,
				Math.max(
					this.renderDimensions.whiteKeyHeight,
					this.renderDimensions.blackKeyHeight
				)
			)
		})
		this.repositionCanvases()
	}

	repositionCanvases() {
		this.getAllCanvases().forEach(canvas => {
			canvas.style.top = this.renderDimensions.getAbsolutePianoPosition() + "px"
		})
	}
	/**
	 *
	 * @param {Integer} noteNumber
	 */
	drawActiveInputKey(noteNumber, color) {
		let dim = this.renderDimensions.getKeyDimensions(noteNumber)
		let isKeyBlack = isBlack(noteNumber)
		let ctx = isKeyBlack ? this.playedKeysCtxBlack : this.playedKeysCtxWhite

		if (isKeyBlack) {
			this.drawBlackKey(ctx, dim, color, true)
		} else {
			this.drawWhiteKey(ctx, dim, color, true)
		}
	}

	drawActiveKey(renderInfo, color) {
		let dim = this.renderDimensions.getKeyDimensions(renderInfo.noteNumber)
		let isKeyBlack = renderInfo.isBlack
		let ctx = isKeyBlack ? this.playedKeysCtxBlack : this.playedKeysCtxWhite

		ctx.fillStyle = color
		if (isKeyBlack) {
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
			Math.max(
				this.renderDimensions.whiteKeyHeight,
				this.renderDimensions.blackKeyHeight
			)
		)
		this.playedKeysCtxBlack.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			Math.max(
				this.renderDimensions.whiteKeyHeight,
				this.renderDimensions.blackKeyHeight
			)
		)
	}

	drawPiano(ctxWhite, ctxBlack) {
		ctxWhite.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			Math.max(
				this.renderDimensions.whiteKeyHeight,
				this.renderDimensions.blackKeyHeight
			)
		)
		ctxBlack.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			Math.max(
				this.renderDimensions.whiteKeyHeight,
				this.renderDimensions.blackKeyHeight
			)
		)
		//Background
		ctxWhite.fillStyle = "rgba(0,0,0,1)"
		ctxWhite.fillRect(
			0,
			5,
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight
		)

		this.drawWhiteKeys(ctxWhite)
		if (getSetting("showKeyNamesOnPianoWhite")) {
			this.drawWhiteKeyNames(ctxWhite)
		}
		// var img = new Image()
		// img.src = "../../blackKey.svg"
		// img.onload = function () {
		this.drawBlackKeys(ctxBlack)
		if (getSetting("showKeyNamesOnPianoBlack")) {
			this.drawBlackKeyNames(ctxBlack)
		}
		// }.bind(this)

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
			let i = Math.max(0, this.renderDimensions.minNoteNumber);
			i <= this.renderDimensions.maxNoteNumber;
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
			let i = Math.max(0, this.renderDimensions.minNoteNumber);
			i <= this.renderDimensions.maxNoteNumber;
			i++
		) {
			let dims = this.renderDimensions.getKeyDimensions(i)
			if (isBlack(i)) {
				this.drawBlackKey(ctxBlack, dims, "black", true)
			}
		}
	}
	drawWhiteKeyNames(ctx) {
		ctx.fillStyle = "black"
		const fontSize = this.renderDimensions.whiteKeyWidth / 2.2
		ctx.font = fontSize + "px Arial black"
		for (
			let i = Math.max(0, this.renderDimensions.minNoteNumber);
			i <= this.renderDimensions.maxNoteNumber;
			i++
		) {
			let dims = this.renderDimensions.getKeyDimensions(i)
			if (!isBlack(i)) {
				let txt = this.getDisplayKey(CONST.MIDI_NOTE_TO_KEY[i + 21] || "")
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
			let i = Math.max(0, this.renderDimensions.minNoteNumber);
			i <= this.renderDimensions.maxNoteNumber;
			i++
		) {
			let dims = this.renderDimensions.getKeyDimensions(i)
			if (isBlack(i)) {
				let txt = this.getDisplayKey(CONST.MIDI_NOTE_TO_KEY[i + 21] || "")
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
	drawWhiteKey(ctx, dims, color) {
		let radius = Math.ceil(this.renderDimensions.whiteKeyWidth / 20)
		let x = dims.x
		let y = Math.floor(dims.y) + 6
		let height = Math.floor(dims.h) - 8
		let width = dims.w

		this.getWhiteKeyPath(ctx, x, y, width, height, radius)

		ctx.fillStyle = color
		ctx.fill()

		ctx.fillStyle = this.getKeyGradient(ctx)
		ctx.fill()

		ctx.closePath()
	}
	getKeyGradient(ctx) {
		if (this.keyGradient == null) {
			this.keyGradient = ctx.createLinearGradient(
				this.renderDimensions.windowWidth / 2,
				0,
				this.renderDimensions.windowWidth / 2,
				this.renderDimensions.whiteKeyHeight
			)
			this.keyGradient.addColorStop(0, "rgba(0,0,0,1)")
			this.keyGradient.addColorStop(1, "rgba(255,255,255,0.5)")
		}
		return this.keyGradient
	}
	getWhiteKeyPath(ctx, x, y, width, height, radius) {
		ctx.beginPath()
		ctx.moveTo(x + 1, y)
		ctx.lineTo(x - 1 + width, y)
		ctx.lineTo(x - 1 + width, y + height - radius)
		ctx.lineTo(x - 1 + width - radius, y + height)
		ctx.lineTo(x + 1 + radius, y + height)
		ctx.lineTo(x + 1, y + height - radius)
		ctx.lineTo(x + 1, y)
	}

	strokeWhiteKey(dims, color) {
		let radius = Math.ceil(this.renderDimensions.whiteKeyWidth / 20)
		let x = dims.x
		let y = Math.floor(dims.y) + 6
		let height = Math.floor(dims.h) - 8
		let width = dims.w
		let ctx = this.playedKeysCtxWhite

		this.getWhiteKeyPath(ctx, x, y, width, height, radius)
		ctx.strokeStyle = "black"
		ctx.lineWidth = 50
		ctx.fill()
		ctx.closePath()
	}
	drawBlackKeySvg(ctx, dims, color) {
		let radiusTop = this.renderDimensions.blackKeyWidth / 15
		let radiusBottom = this.renderDimensions.blackKeyWidth / 8
		let x = dims.x
		let y = dims.y + 5
		let height = dims.h
		let width = dims.w

		ctx.drawImage(this.blackKeyImg, x, y, width, height)
	}
	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Dimensions} dims
	 */
	drawBlackKey(ctx, dims, color, noShadow) {
		let radiusTop = 0 //this.renderDimensions.blackKeyWidth / 15
		let radiusBottom = this.renderDimensions.blackKeyWidth / 8
		let x = dims.x
		let y = dims.y + 6
		let height = dims.h
		let width = dims.w
		color = color || "black"

		this.getBlackKeyPath(ctx, x, y, radiusTop, width, height, radiusBottom)

		ctx.fillStyle = color
		ctx.fill()
		if (!noShadow) {
			ctx.fillStyle = this.getKeyGradient()
			ctx.fill()
		}
		ctx.closePath()
	}
	strokeBlackKey(dims, color) {
		let radiusTop = 0 //this.renderDimensions.blackKeyWidth / 15
		let radiusBottom = this.renderDimensions.blackKeyWidth / 8
		let x = dims.x
		let y = dims.y + 6
		let height = dims.h
		let width = dims.w
		let ctx = this.playedKeysCtxBlack
		color = color || "white"

		this.getBlackKeyPath(ctx, x, y, radiusTop, width, height, radiusBottom)

		ctx.strokeStyle = color
		ctx.stroke()
		ctx.closePath()
	}

	getBlackKeyPath(ctx, x, y, radiusTop, width, height, radiusBottom) {
		ctx.beginPath()
		ctx.moveTo(x + 1, y + radiusTop)
		ctx.lineTo(x + 1 + radiusTop, y)
		ctx.lineTo(x - 1 - radiusTop + width, y)
		ctx.lineTo(x - 1 + width, y + radiusTop)
		ctx.lineTo(x - 1 + width, y + height - radiusBottom)
		ctx.lineTo(x - 1 + width - radiusBottom, y + height)
		ctx.lineTo(x + 1 + radiusBottom, y + height)
		ctx.lineTo(x + 1, y + height - radiusBottom)
		ctx.lineTo(x + 1, y)
	}

	getPianoCanvasWhite() {
		if (!this.pianoCanvasWhite) {
			this.pianoCanvasWhite = DomHelper.createCanvas(
				this.renderDimensions.windowWidth,
				Math.max(
					this.renderDimensions.whiteKeyHeight,
					this.renderDimensions.blackKeyHeight
				),
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
				Math.max(
					this.renderDimensions.whiteKeyHeight,
					this.renderDimensions.blackKeyHeight
				),
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
				Math.max(
					this.renderDimensions.whiteKeyHeight,
					this.renderDimensions.blackKeyHeight
				),
				{
					position: "absolute",
					left: "0px",
					zIndex: 99,
					boxShadow: "0px 0px 15px 15px rgba(0,0,0,0.4)"
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
				Math.max(
					this.renderDimensions.whiteKeyHeight,
					this.renderDimensions.blackKeyHeight
				),
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
				this.onNoteOn(keyUnderMouse)
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
					this.onNoteOff(this.currentKeyUnderMouse)
					this.onNoteOn(keyUnderMouse)
					this.currentKeyUnderMouse = keyUnderMouse
				}
			} else {
				this.clearCurrentKeyUnderMouse()
			}
		}
	}
	clearCurrentKeyUnderMouse() {
		if (this.currentKeyUnderMouse >= 0) {
			this.onNoteOff(this.currentKeyUnderMouse)
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
		let canvHt = Math.max(
			this.renderDimensions.whiteKeyHeight,
			this.renderDimensions.blackKeyHeight
		)
		let x = ev.clientX
		let y =
			ev.clientY -
			(this.renderDimensions.windowHeight -
				canvHt -
				(this.renderDimensions.windowHeight -
					canvHt -
					this.renderDimensions.getAbsolutePianoPosition()))
		return { x, y }
	}
}
