import { DomHelper } from "../DomHelper.js"
import { PianoRender } from "./PianoRender.js"
import { DebugRender } from "./DebugRender.js"
import { OverlayRender } from "./OverlayRender.js"
import { NoteRender } from "./NoteRender.js"
import { SustainRender } from "./SustainRenderer.js"
import { RenderDimensions } from "./RenderDimensions.js"
import { BackgroundRender } from "./BackgroundRender.js"
import { MeasureLinesRender } from "./MeasureLinesRender.js"
import { ProgressBarRender } from "./ProgressBarRender.js"

const DEBUG = true

const MIN_WIDTH = 1040
const MIN_HEIGHT = 560

const LOOK_BACK_TIME = 4
const LOOK_AHEAD_TIME = 10

const PROGRESS_BAR_CANVAS_HEIGHT = 20

/**
 * Class that handles all rendering
 */
export class Render {
	constructor(player) {
		this.renderDimensions = new RenderDimensions()
		this.renderDimensions.registerResizeCallback(this.setupCanvases.bind(this))
		this.setupCanvases()

		this.pianoRender = new PianoRender(this.renderDimensions)

		this.overlayRender = new OverlayRender(this.ctx, this.renderDimensions)
		this.addStartingOverlayMessage()

		this.debugRender = new DebugRender(DEBUG, this.ctx, this.renderDimensions)
		this.noteRender = new NoteRender(
			this.ctx,
			this.renderDimensions,
			this.pianoRender,
			LOOK_BACK_TIME,
			LOOK_AHEAD_TIME
		)
		this.sustainRender = new SustainRender(
			this.ctx,
			this.renderDimensions,
			LOOK_BACK_TIME,
			LOOK_AHEAD_TIME
		)

		this.measureLinesRender = new MeasureLinesRender(
			this.ctx,
			this.renderDimensions
		)

		this.progressBarRender = new ProgressBarRender(
			this.progressBarCtx,
			this.renderDimensions
		)

		this.backgroundRender = new BackgroundRender(
			this.ctxBG,
			this.renderDimensions
		)

		this.mouseX = 0
		this.mouseY = 0

		this.playerState = player.getState()
	}

	/**
	 * Main rendering function
	 */
	render(playerState) {
		this.playerState = playerState
		this.ctx.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			this.renderDimensions.windowHeight
		)

		this.pianoRender.clearPlayedKeysCanvases()

		let renderInfos = []
		if (!playerState.loading && playerState.song) {
			this.progressBarRender.render(playerState)
			this.measureLinesRender.render(playerState, this.settings)
			this.sustainRender.render(playerState, this.settings)

			renderInfos = this.noteRender.render(playerState, this.settings)
		}

		this.overlayRender.render()

		if (this.settings.showNoteDebugInfo) {
			this.debugRender.render(renderInfos, this.mouseX, this.mouseY)
		}

		if (this.settings.showBPM) {
			this.drawBPM(playerState)
		}
	}
	drawBPM(playerState) {
		this.ctx.font = "20px Arial black"
		this.ctx.fillStyle = "rgba(255,255,255,0.8)"
		this.ctx.textBaseline = "top"
		this.ctx.fillText(
			Math.round(playerState.bpm) + " BPM",
			20,
			this.menuHeight + PROGRESS_BAR_CANVAS_HEIGHT + 12
		)
	}

	addStartingOverlayMessage() {
		this.overlayRender.addOverlay("MIDiano", 150)
		this.overlayRender.addOverlay("A Javascript MIDI-Player", 150)
		this.overlayRender.addOverlay(
			"Example song by Bernd Krueger from piano-midi.de",
			150
		)
	}

	/**
	 *
	 */
	setupCanvases() {
		DomHelper.setCanvasSize(
			this.getBgCanvas(),
			this.renderDimensions.windowWidth,
			this.renderDimensions.windowHeight
		)

		DomHelper.setCanvasSize(
			this.getMainCanvas(),
			this.renderDimensions.windowWidth,
			this.renderDimensions.windowHeight
		)

		DomHelper.setCanvasSize(
			this.getProgressBarCanvas(),
			this.renderDimensions.windowWidth,
			20
		)
	}
	getBgCanvas() {
		if (!this.cnvBG) {
			this.cnvBG = DomHelper.createCanvas(
				this.renderDimensions.windowWidth,
				this.renderDimensions.windowHeight,
				{
					backgroundColor: "black",
					position: "absolute",
					top: "0px",
					left: "0px"
				}
			)
			document.body.appendChild(this.cnvBG)
			this.ctxBG = this.cnvBG.getContext("2d")
		}
		return this.cnvBG
	}
	getMainCanvas() {
		if (!this.cnv) {
			this.cnv = DomHelper.createCanvas(
				this.renderDimensions.windowWidth,
				this.renderDimensions.windowHeight,
				{
					position: "absolute",
					top: "0px",
					left: "0px"
				}
			)
			document.body.appendChild(this.cnv)
			this.ctx = this.cnv.getContext("2d")
		}
		return this.cnv
	}

	getProgressBarCanvas() {
		if (!this.progressBarCanvas) {
			this.progressBarCanvas = DomHelper.createCanvas(
				this.renderDimensions.windowWidth,
				PROGRESS_BAR_CANVAS_HEIGHT,
				{}
			)
			this.progressBarCanvas.id = "progressBarCanvas"
			document.body.appendChild(this.progressBarCanvas)
			this.progressBarCtx = this.progressBarCanvas.getContext("2d")
		}
		return this.progressBarCanvas
	}

	isNoteDrawn(note, tracks) {
		return !tracks[note.track] || !tracks[note.track].draw
	}

	updateSettings(settingsObj) {
		this.settings = settingsObj
	}
	isOnMainCanvas(position) {
		return (
			position.x > this.menuHeight &&
			position.y <
				this.renderDimensions.windowHeight -
					this.renderDimensions.whiteKeyHeight
		)
	}
	setMouseCoords(x, y) {
		this.mouseX = x
		this.mouseY = y
	}
	getTimeFromHeight(height) {
		return (
			(height * this.renderDimensions.noteToHeightConst) /
			(this.renderDimensions.windowHeight -
				this.renderDimensions.whiteKeyHeight) /
			1000
		)
	}
	onMenuHeightChanged(menuHeight) {
		this.menuHeight = menuHeight
		this.getProgressBarCanvas().style.top = menuHeight + "px"
		this.noteRender.setMenuHeight(menuHeight)
	}
}
