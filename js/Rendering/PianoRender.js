import { DomHelper } from "../DomHelper.js"
import { isBlack } from "../Util.js"
/**
 * Class to render the piano (and the colored keys played on the piano)
 */
export class PianoRender {
	constructor(renderDimensions) {
		this.renderDimensions = renderDimensions
		this.resize()
		this.renderDimensions.registerResizeCallback(this.resize.bind(this))
	}
	/**
	 * Resize canvases and redraw piano.
	 */
	resize() {
		this.resizeCanvases()
		this.drawPiano(this.ctxWhite, this.ctxBlack)
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
	 * @param {Integer} noteNumber
	 */
	drawActiveInputKey(noteNumber) {
		let dim = this.renderDimensions.getKeyDimensions(noteNumber - 21)
		let keyBlack = isBlack(noteNumber - 21)
		let ctx = keyBlack ? this.playedKeysCtxBlack : this.playedKeysCtxWhite
		ctx.fillStyle = "rgba(255,0,0,1)"
		if (keyBlack) {
			this.drawBlackKey(ctx, dim, "rgba(255,0,0,1)")
		} else {
			ctx.fillRect(dim.x + 1, dim.y, dim.w - 2, dim.h)
		}
	}

	drawActiveKey(renderInfo, color) {
		let dim = this.renderDimensions.getKeyDimensions(renderInfo.noteNumber - 21)
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
		//Background
		ctxWhite.fillStyle = "rgba(0,0,0,1)"
		ctxWhite.fillRect(
			0,
			5,
			this.renderDimensions.windowWidth,
			this.renderDimensions.whiteKeyHeight + 10
		)

		this.drawWhiteKeys(ctxWhite)
		this.drawBlackKeys(ctxBlack)

		//velvet
		ctxWhite.strokeStyle = "rgba(155,50,50,1)"
		ctxWhite.shadowColor = "rgba(155,50,50,1)"
		ctxWhite.shadowOffsetY = 2
		ctxWhite.shadowBlur = 2
		ctxWhite.lineWidth = 4
		ctxWhite.beginPath()
		ctxWhite.moveTo(52 * this.renderDimensions.whiteKeyWidth, 2)
		ctxWhite.lineTo(0, 2)
		ctxWhite.closePath()
		ctxWhite.stroke()
	}

	drawWhiteKeys(ctxWhite) {
		for (let i = 0; i < 88; i++) {
			let dims = this.renderDimensions.getKeyDimensions(i)
			if (!isBlack(i)) {
				this.drawWhiteKey(ctxWhite, dims)
			}
		}
	}

	drawBlackKeys(ctxBlack) {
		let rgr2 = ctxBlack.createLinearGradient(
			this.renderDimensions.windowWidth / 2,
			-this.renderDimensions.windowHeight * 0.05,
			this.renderDimensions.windowWidth / 2,
			this.renderDimensions.windowHeight * 0.1
		)
		rgr2.addColorStop(1, "rgba(30,30,30,1)")
		rgr2.addColorStop(0, "black")
		ctxBlack.fillStyle = rgr2
		for (let i = 0; i < 88; i++) {
			let dims = this.renderDimensions.getKeyDimensions(i)
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

		let whiteKeyHeight = this.renderDimensions.whiteKeyHeight

		ctx.beginPath()
		ctx.moveTo(x + 1, y)
		ctx.lineTo(x - 1 + width, y)
		ctx.lineTo(x - 1 + width, y + height - radius)
		ctx.lineTo(x - 1 + width - radius, y + height)
		ctx.lineTo(x + 1 + radius, y + height)
		ctx.lineTo(x + 1, y + height - radius)
		ctx.lineTo(x + 1, y)

		ctx.fillStyle = "rgba(255,255,255,1)"
		ctx.fill()

		let rgr = ctx.createLinearGradient(
			x,
			whiteKeyHeight / 2,
			x + width,
			whiteKeyHeight / 2
		)
		rgr.addColorStop(0.9, "rgba(0,0,0,0.1)")
		rgr.addColorStop(0.5, "rgba(0,0,0,0)")
		rgr.addColorStop(0.1, "rgba(0,0,0,0.1)")
		ctx.fillStyle = rgr
		ctx.fill()

		let rgr2 = ctx.createLinearGradient(
			this.renderDimensions.windowWidth / 2,
			0,
			this.renderDimensions.windowWidth / 2,
			whiteKeyHeight
		)
		rgr2.addColorStop(1, "rgba(255,255,255,0.5)")
		rgr2.addColorStop(0, "rgba(0,0,0,0.5)")
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
			document.body.appendChild(this.playedKeysCanvasBlack)
			this.playedKeysCtxBlack = this.playedKeysCanvasBlack.getContext("2d")
		}
		return this.playedKeysCanvasBlack
	}
}
