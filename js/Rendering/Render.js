import { DomHelper } from "../DomHelper.js"
import { formatTime } from "../Util.js"
import { isBlack } from "../Util.js"
import { PianoRender } from "./PianoRender.js"
import { DebugRender } from "./DebugRender.js"
import { OverlayRender } from "./OverlayRender.js"
import { NoteRender } from "./NoteRender.js"

const DEBUG = true

const MIN_WIDTH = 1040
const MIN_HEIGHT = 560

export class Render {
	constructor(player) {
		this.windowWidth = Math.max(MIN_WIDTH, Math.floor(window.innerWidth))
		this.windowHeight = Math.max(MIN_HEIGHT, Math.floor(window.innerHeight))

		this.pianoRender = new PianoRender(this.windowWidth, this.windowHeight)
		this.setupCanvases()
		this.overlayRender = new OverlayRender(this.ctx)

		this.overlayRender.addOverlay("MIDIano", 150)
		this.overlayRender.addOverlay("A Javascript MIDI-Player", 150)
		this.overlayRender.addOverlay(
			"Example song by Bernd Krueger from piano-midi.de",
			150
		)

		this.debugRender = new DebugRender(DEBUG, this.ctx)
		this.noteRender = new NoteRender(this.ctx, this.pianoRender)

		this.resize()

		this.grabSpeed = 0

		this.mouseX = 0
		this.mouseY = 0

		this.playerState = player.getState()

		window.addEventListener("resize", this.resize.bind(this))
	}
	updateSettings(settingsObj) {
		this.settings = settingsObj
	}
	isOnMainCanvas(position) {
		return (
			position.x > this.menuHeight &&
			position.y < this.windowHeight - this.pianoRender.whiteKeyHeight
		)
	}
	setMouseCoords(x, y) {
		this.mouseX = x
		this.mouseY = y
	}
	getTimeFromHeight(height) {
		return (
			(height * this.noteToHeightConst) /
			(this.windowHeight - this.pianoRender.whiteKeyHeight) /
			1000
		)
	}
	onMenuHeightChanged(menuHeight) {
		this.menuHeight = menuHeight
		this.getProgressBarCanvas().style.top = menuHeight + "px"
	}
	/**
	 * (Re)sets all dimensions dependent on window size
	 */
	resize() {
		this.windowWidth = Math.max(1040, Math.floor(window.innerWidth))
		this.windowHeight = Math.floor(window.innerHeight)
		this.noteToHeightConst = this.windowHeight * 3

		this.keyDimensions = []

		this.setupCanvases()
		this.pianoRender.resize(this.windowWidth, this.windowHeight)
		this.overlayRender.resize(this.windowWidth, this.windowHeight)
		this.debugRender.resize(this.windowWidth, this.windowHeight)
		this.noteRender.resize(
			this.windowWidth,
			this.windowHeight,
			this.noteToHeightConst
		)
		this.drawBackground()
	}
	/**
	 * Main rendering function
	 */
	render(playerState) {
		this.playerState = playerState
		this.ctx.clearRect(0, 0, this.windowWidth, this.windowHeight)
		this.progressBarCtx.clearRect(0, 0, this.windowWidth, this.windowHeight)
		this.pianoRender.clearPlayedKeysCanvases()
		// let time = playerState.time + this.settings.renderOffset

		let renderInfos = []
		if (!playerState.loading && playerState.song) {
			this.drawProgressBar(playerState)
			// this.drawTempoLines(time)
			renderInfos = this.noteRender.render(playerState, this.settings)
		}

		this.overlayRender.render()
		this.debugRender.render(renderInfos, this.mouseX, this.mouseY)
	}

	/**
	 *
	 */
	setupCanvases() {
		DomHelper.setCanvasSize(
			this.getBgCanvas(),
			this.windowWidth,
			this.windowHeight
		)

		DomHelper.setCanvasSize(
			this.getMainCanvas(),
			this.windowWidth,
			this.windowHeight
		)
		this.pianoRender.setupCanvases()

		DomHelper.setCanvasSize(this.getProgressBarCanvas(), this.windowWidth, 20)
	}
	getBgCanvas() {
		if (!this.cnvBG) {
			this.cnvBG = DomHelper.createCanvas(this.windowWidth, this.windowHeight, {
				backgroundColor: "black",
				position: "absolute",
				top: "0px",
				left: "0px"
			})
			document.body.appendChild(this.cnvBG)
			this.ctxBG = this.cnvBG.getContext("2d")
		}
		return this.cnvBG
	}
	getMainCanvas() {
		if (!this.cnv) {
			this.cnv = DomHelper.createCanvas(this.windowWidth, this.windowHeight, {
				position: "absolute",
				top: "0px",
				left: "0px"
			})
			document.body.appendChild(this.cnv)
			this.ctx = this.cnv.getContext("2d")
		}
		return this.cnv
	}

	getProgressBarCanvas() {
		if (!this.progressBarCanvas) {
			this.progressBarCanvas = DomHelper.createCanvas(this.windowWidth, 20, {})
			this.progressBarCanvas.id = "progressBarCanvas"
			document.body.appendChild(this.progressBarCanvas)
			this.progressBarCtx = this.progressBarCanvas.getContext("2d")
		}
		return this.progressBarCanvas
	}
	drawProgressBar(playerState) {
		let ctx = this.progressBarCtx
		let progressPercent = playerState.time / (playerState.end / 1000)
		ctx.fillStyle = "rgba(150,150,150,0.8)"
		let ht = this.windowHeight - this.pianoRender.whiteKeyHeight
		ctx.fillRect(this.windowWidth * progressPercent, 0, 4, 20)
		ctx.fillStyle = "rgba(50,150,50,1)"
		ctx.fillRect(0, 2, this.windowWidth * progressPercent, 16)

		ctx.fillStyle = "rgba(0,0,0,1)"
		let text =
			formatTime(playerState.time) + "/" + formatTime(playerState.end / 1000)
		let wd = ctx.measureText(text).width
		ctx.font = "14px Arial black"
		ctx.fillText(text, this.windowWidth / 2 - wd / 2, 15)
	}

	drawBackground() {
		let c = this.ctxBG
		const col1 = "rgba(200,200,200,1)"
		const col3 = "rgba(160,160,160,0.8)"
		const col2 = "rgba(140,140,140,0.8)"
		c.strokeStyle = col1
		c.fillStyle = col2
		let whiteKey = 0
		for (let i = 0; i < 88; i++) {
			if (!isBlack(i)) {
				c.strokeStyle = i % 2 ? col3 : col3
				c.fillStyle = (i + 2) % 2 ? col3 : col2
				c.lineWidth = 1
				//c.globalAlpha = 0.25  + (i+9)%3 / 4  + (i + 9) % 12 / 48
				let dim = this.pianoRender.getKeyDimensions(i)
				c.fillRect(dim.x, dim.y, dim.w, this.windowHeight)
				c.strokeRect(dim.x, dim.y, dim.w, this.windowHeight)

				if (1 + (whiteKey % 7) == 3) {
					c.lineWidth = 5
					c.beginPath()
					c.moveTo(dim.x, 0)
					c.lineTo(dim.x, this.windowHeight)
					c.stroke()
					c.closePath()
				}
				whiteKey++
			}
		}
	}

	isNoteDrawn(note, tracks) {
		return !tracks[note.track] || !tracks[note.track].draw
	}

	/**
	 *
	 * @param {Number} currentTime
	 */
	drawTempoLines(playerState) {
		let currentTime = playerState.time
		let tempoLines = playerState.song ? playerState.song.getTempoLines() : []
		let ctx = this.ctx
		let height = this.windowHeight - this.pianoRender.whiteKeyHeight

		ctx.strokeStyle = "rgba(255,255,255,0.05)"

		ctx.lineWidth = 1
		let currentSecond = Math.floor(currentTime)
		for (let i = currentSecond; i < currentSecond + 6; i++) {
			if (!tempoLines[i]) {
				continue
			}
			tempoLines[i].forEach(tempoLine => {
				let ht =
					height -
					((tempoLine - currentTime * 1000) / this.noteToHeightConst) * height
				ctx.beginPath()
				ctx.moveTo(0, ht)
				ctx.lineTo(this.windowWidth, ht)
				ctx.closePath()
				ctx.stroke()
			})
		}
	}

	/**
	 *
	 * @param {CanvasRenderingContext2D} ctxWhite
	 * @param {CanvasRenderingContext2D} ctxBlack
	 */
}
