import { DomHelper } from "../DomHelper.js"
import { isBlack } from "../Util.js"

export class PianoRender {
	constructor(windowWidth, windowHeight, whiteKeyHeight) {
		this.windowWidth = windowWidth
		this.windowHeight = windowHeight
		this.keyDimensions = {}
		this.computeKeyDimensions()
	}
	resize(windowWidth, windowHeight) {
		this.windowWidth = windowWidth
		this.windowHeight = windowHeight

		this.keyDimensions = {}
		this.computeKeyDimensions()

		this.setupCanvases()

		this.drawPiano(this.ctxWhite, this.ctxBlack)
	}
	computeKeyDimensions() {
		this.whiteKeyWidth = Math.max(20, this.windowWidth / 52)
		this.whiteKeyHeight = this.whiteKeyWidth * 4.5
		this.blackKeyWidth = Math.floor(this.whiteKeyWidth * 0.5829787234)
		this.blackKeyHeight = Math.floor((this.whiteKeyHeight * 2) / 3)
	}
	/**
	 *
	 * @param {NoteEvent} note
	 */
	setupCanvases() {
		DomHelper.setCanvasSize(
			this.getPianoCanvasWhite(),
			this.windowWidth,
			this.whiteKeyHeight
		)
		this.getPianoCanvasWhite().style.top =
			this.windowHeight - this.whiteKeyHeight + "px"

		DomHelper.setCanvasSize(
			this.getPlayedKeysWhite(),
			this.windowWidth,
			this.whiteKeyHeight
		)
		this.getPlayedKeysWhite().style.top =
			this.windowHeight - this.whiteKeyHeight + "px"

		DomHelper.setCanvasSize(
			this.getPianoCanvasBlack(),
			this.windowWidth,
			this.whiteKeyHeight
		)
		this.getPianoCanvasBlack().style.top =
			this.windowHeight - this.whiteKeyHeight + "px"

		DomHelper.setCanvasSize(
			this.getPlayedKeysBlack(),
			this.windowWidth,
			this.whiteKeyHeight
		)
		this.getPlayedKeysBlack().style.top =
			this.windowHeight - this.whiteKeyHeight + "px"
	}
	drawActiveInputKey(noteNumber) {
		let dim = this.getKeyDimensions(noteNumber - 21)
		let keyBlack = isBlack(noteNumber - 21)
		console.log(keyBlack)
		let ctx = keyBlack ? this.playedKeysCtxBlack : this.playedKeysCtxWhite
		// let x = this.getKeyX(noteNumber)
		// let w = keyBlack ? this.blackKeyWidth : this.whiteKeyWidth
		ctx.fillStyle = "rgba(255,0,0,1)"
		if (keyBlack) {
			this.drawBlackKey(ctx, dim, "rgba(255,0,0,1)")
		} else {
			ctx.fillRect(dim.x + 1, dim.y, dim.w - 2, dim.h)
		}
	}
	drawActiveKey(renderInfo, color) {
		let dim = this.getKeyDimensions(renderInfo.noteNumber - 21)
		let keyBlack = renderInfo.keyBlack
		let ctx = keyBlack ? this.playedKeysCtxBlack : this.playedKeysCtxWhite

		ctx.fillStyle = color
		if (keyBlack) {
			ctx.globalAlpha = 0.5
			ctx.fillRect(dim.x + 1, dim.y, dim.w - 2, dim.h)
			ctx.globalAlpha = 1
		} else {
			ctx.save()
			ctx.beginPath()
			ctx.rect(dim.x + 1, dim.y + 4, dim.w - 2, dim.h - 4)
			ctx.clip()
			let lgr = ctx.createLinearGradient(
				dim.x,
				dim.y + dim.h / 2,
				dim.x + dim.w,
				dim.y + dim.h / 2
			)
			lgr.addColorStop(0, "rgba(0,0,0,0.7)")
			lgr.addColorStop(0.4, "rgba(0,0,0,0)")
			lgr.addColorStop(0.6, "rgba(0,0,0,0)")
			lgr.addColorStop(1, "rgba(0,0,0,0.7)")
			ctx.fillStyle = lgr
			ctx.fillRect(dim.x + 1, dim.y, dim.w - 2, dim.h)
			ctx.fillStyle = color
			ctx.fillRect(dim.x + 1, dim.y, dim.w - 2, dim.h)
			ctx.closePath()
			ctx.restore()
		}
	}

	clearPlayedKeysCanvases() {
		this.playedKeysCtxWhite.clearRect(
			0,
			0,
			this.windowWidth,
			this.whiteKeyHeight
		)
		this.playedKeysCtxBlack.clearRect(
			0,
			0,
			this.windowWidth,
			this.whiteKeyHeight
		)
	}

	drawPiano(ctxWhite, ctxBlack) {
		//Background
		ctxWhite.fillStyle = "rgba(0,0,0,1)"
		ctxWhite.fillRect(0, 5, this.windowWidth, this.whiteKeyHeight + 10)

		this.drawWhiteKeys(ctxWhite)
		this.drawBlackKeys(ctxBlack)

		//velvet
		ctxWhite.strokeStyle = "rgba(155,50,50,1)"
		ctxWhite.shadowColor = "rgba(155,50,50,1)"
		ctxWhite.shadowOffsetY = 2
		ctxWhite.shadowBlur = 2
		ctxWhite.lineWidth = 4
		ctxWhite.beginPath()
		ctxWhite.moveTo(52 * this.whiteKeyWidth, 2)
		ctxWhite.lineTo(0, 2)
		ctxWhite.closePath()
		ctxWhite.stroke()
	}

	drawWhiteKeys(ctxWhite) {
		for (let i = 0; i < 88; i++) {
			let dims = this.getKeyDimensions(i)
			if (!isBlack(i)) {
				this.drawWhiteKey(ctxWhite, dims)
			}
		}
	}

	drawBlackKeys(ctxBlack) {
		let rgr2 = ctxBlack.createLinearGradient(
			this.windowWidth / 2,
			-this.windowHeight * 0.05,
			this.windowWidth / 2,
			this.windowHeight * 0.1
		)
		rgr2.addColorStop(1, "rgba(30,30,30,1)")
		rgr2.addColorStop(0, "black")
		ctxBlack.fillStyle = rgr2
		for (let i = 0; i < 88; i++) {
			let dims = this.getKeyDimensions(i)
			if (isBlack(i)) {
				this.drawBlackKey(ctxBlack, dims)
			}
		}
	}
	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Dimensions} dims
	 */
	drawWhiteKey(ctx, dims) {
		let radius = 4
		let x = dims.x
		let y = dims.y - 2
		let height = dims.h
		let width = dims.w

		ctx.beginPath()
		ctx.moveTo(x + 1, y)
		ctx.lineTo(x - 1 + width, y)
		ctx.lineTo(x - 1 + width, y + height - radius)
		ctx.lineTo(x - 1 + width - radius, y + height)
		ctx.lineTo(x + 1 + radius, y + height)
		ctx.lineTo(x + 1, y + height - radius)
		ctx.lineTo(x + 1, y)

		ctx.fillStyle = "white"
		ctx.fill()

		let rgr = ctx.createLinearGradient(
			x,
			this.whiteKeyHeight / 2,
			x + width,
			this.whiteKeyHeight / 2
		)
		rgr.addColorStop(0.9, "rgba(0,0,0,0.1)")
		rgr.addColorStop(0.5, "rgba(0,0,0,0)")
		rgr.addColorStop(0.1, "rgba(0,0,0,0.1)")
		ctx.fillStyle = rgr
		ctx.fill()

		let rgr2 = ctx.createLinearGradient(
			this.windowWidth / 2,
			0,
			this.windowWidth / 2,
			this.whiteKeyHeight
		)
		rgr2.addColorStop(1, "rgba(255,255,255,0.5)")
		rgr2.addColorStop(0, "rgba(0,0,0,0.6)")
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

		// let rgr = ctx.createLinearGradient(
		// 	x,
		// 	this.whiteKeyHeight / 2,
		// 	x + width,
		// 	this.whiteKeyHeight / 2
		// )
		// rgr.addColorStop(0.9, "rgba(0,0,0,0.3)")
		// rgr.addColorStop(0.5, "rgba(0,0,0,0)")
		// rgr.addColorStop(0.1, "rgba(0,0,0,0.3)")
		// ctx.fillStyle = rgr
		// ctx.fill()

		// let rgr2 = ctx.createLinearGradient(
		// 	this.windowWidth / 2,
		// 	0,
		// 	this.windowWidth / 2,
		// 	this.whiteKeyHeight
		// )
		// rgr2.addColorStop(1, "rgba(0,0,0,0.5)")
		// rgr2.addColorStop(0, "rgba(0,0,0,0.6)")
		// ctx.fillStyle = rgr2
		// ctx.fill()

		ctx.closePath()
	}

	getPianoCanvasWhite() {
		if (!this.pianoCanvasWhite) {
			this.pianoCanvasWhite = DomHelper.createCanvas(
				this.windowWidth,
				this.whiteKeyHeight,
				{
					position: "absolute",
					left: "0px"
				}
			)
			document.body.appendChild(this.pianoCanvasWhite)
			this.ctxWhite = this.pianoCanvasWhite.getContext("2d")
		}
		return this.pianoCanvasWhite
	}
	getPlayedKeysWhite() {
		if (!this.playedKeysCanvasWhite) {
			this.playedKeysCanvasWhite = DomHelper.createCanvas(
				this.windowWidth,
				this.whiteKeyHeight,
				{
					position: "absolute",
					left: "0px"
				}
			)
			document.body.appendChild(this.playedKeysCanvasWhite)
			this.playedKeysCtxWhite = this.playedKeysCanvasWhite.getContext("2d")
		}
		return this.playedKeysCanvasWhite
	}
	getPianoCanvasBlack() {
		if (!this.pianoCanvasBlack) {
			this.pianoCanvasBlack = DomHelper.createCanvas(
				this.windowWidth,
				this.whiteKeyHeight,
				{
					position: "absolute",
					left: "0px",
					boxShadow: "0px -3px 15px 5px rgba(0,0,0,0.4)"
				}
			)
			document.body.appendChild(this.pianoCanvasBlack)
			this.ctxBlack = this.pianoCanvasBlack.getContext("2d")
		}
		return this.pianoCanvasBlack
	}
	getPlayedKeysBlack() {
		if (!this.playedKeysCanvasBlack) {
			this.playedKeysCanvasBlack = DomHelper.createCanvas(
				this.windowWidth,
				this.whiteKeyHeight,
				{
					position: "absolute",
					left: "0px"
				}
			)
			document.body.appendChild(this.playedKeysCanvasBlack)
			this.playedKeysCtxBlack = this.playedKeysCanvasBlack.getContext("2d")
		}
		return this.playedKeysCanvasBlack
	}

	/**
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
	 *
	 * @param {Number} noteNumber
	 * @param {Boolean} isNoteBlack
	 */
	getKeyX(noteNumber, isNoteBlack) {
		return (
			(noteNumber -
				Math.floor(Math.max(0, noteNumber + 11) / 12) -
				Math.floor(Math.max(0, noteNumber + 8) / 12) -
				Math.floor(Math.max(0, noteNumber + 6) / 12) -
				Math.floor(Math.max(0, noteNumber + 3) / 12) -
				Math.floor(Math.max(0, noteNumber + 1) / 12)) *
				this.whiteKeyWidth +
			(this.whiteKeyWidth - this.blackKeyWidth / 2) * isNoteBlack
		)
	}
}
