import { DomHelper } from "../ui/DomHelper.js"
import { PianoRender } from "./PianoRender.js"
import { DebugRender } from "./DebugRender.js"
import { OverlayRender } from "./OverlayRender.js"
import { NoteRender } from "./NoteRender.js"
import { SustainRender } from "./SustainRenderer.js"
import { RenderDimensions } from "./RenderDimensions.js"
import { BackgroundRender } from "./BackgroundRender.js"
import { MeasureLinesRender } from "./MeasureLinesRender.js"
import { ProgressBarRender } from "./ProgressBarRender.js"
import { getSetting } from "../settings/Settings.js"
import { isBlack } from "../Util.js"
import { getTrackColor, isTrackDrawn } from "../player/Tracks.js"

const DEBUG = true

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

		this.showKeyNamesOnPianoWhite = getSetting("showKeyNamesOnPianoWhite")
		this.showKeyNamesOnPianoBlack = getSetting("showKeyNamesOnPianoBlack")
	}

	setPianoInputListeners(onNoteOn, onNoteOff) {
		this.pianoRender.setPianoInputListeners(onNoteOn, onNoteOff)
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
		if (
			this.showKeyNamesOnPianoWhite != getSetting("showKeyNamesOnPianoWhite") ||
			this.showKeyNamesOnPianoBlack != getSetting("showKeyNamesOnPianoBlack")
		) {
			this.showKeyNamesOnPianoWhite = getSetting("showKeyNamesOnPianoWhite")
			this.showKeyNamesOnPianoBlack = getSetting("showKeyNamesOnPianoBlack")
			this.pianoRender.resize()
		}

		this.backgroundRender.renderIfColorsChanged()

		let renderInfos = []
		let renderInfosByTrackMap = this.getRenderInfoByTrackMap(playerState)
		const time = this.getRenderTime(playerState)
		const end = playerState.end
		if (!playerState.loading && playerState.song) {
			const measureLines = playerState.song
				? playerState.song.getMeasureLines()
				: []

			this.progressBarRender.render(time, end)
			this.measureLinesRender.render(time, measureLines)
			this.sustainRender.render(
				time,
				playerState.song.sustainsBySecond,
				playerState.song.sustainPeriods
			)

			this.noteRender.render(
				time,
				renderInfosByTrackMap,
				playerState.inputActiveNotes
			)
		}

		this.overlayRender.render()

		this.debugRender.render(renderInfosByTrackMap, this.mouseX, this.mouseY)

		if (getSetting("showBPM")) {
			this.drawBPM(playerState)
		}
	}
	/**
	 * Returns current time adjusted for the render-offset from the settings
	 * @param {Object} playerState
	 */
	getRenderTime(playerState) {
		return playerState.time + getSetting("renderOffset") / 1000
	}
	getRenderInfoByTrackMap(playerState) {
		let renderInfoByTrackMap = {}
		if (playerState)
			if (playerState.song) {
				playerState.song.activeTracks.forEach((track, trackIndex) => {
					if (isTrackDrawn(trackIndex)
					) {
						renderInfoByTrackMap[trackIndex] = { black: [], white: [] }

						let time = this.getRenderTime(playerState)
						let lookBackTime = Math.floor(time - LOOK_BACK_TIME)
						let lookAheadTime = Math.ceil(
							time + this.renderDimensions.getSecondsDisplayed()
						)

						for (let i = lookBackTime; i < lookAheadTime; i++) {
							if (track.notesBySeconds[i]) {
								track.notesBySeconds[i]
									.filter(note => note.instrument != "percussion")
									.map(note => this.getNoteRenderInfo(note, time))
									.forEach(renderInfo =>
										renderInfo.keyBlack
											? renderInfoByTrackMap[trackIndex].black.push(renderInfo)
											: renderInfoByTrackMap[trackIndex].white.push(renderInfo)
									)
							}
						}
					}
				})
			}
		return renderInfoByTrackMap
	}
	getNoteRenderInfo(note, time) {
		time *= 1000
		let noteDims = this.renderDimensions.getNoteDimensions(
			note.noteNumber,
			time,
			note.timestamp,
			note.offTime,
			note.sustainOffTime
		)
		let isOn = note.timestamp < time && note.offTime > time ? 1 : 0
		let noteDoneRatio = 1 - (note.offTime - time) / note.duration
		noteDoneRatio *= isOn
		let rad = (getSetting("noteBorderRadius") / 100) * noteDims.w
		if (noteDims.h < rad * 2) {
			rad = noteDims.h / 2
		}
		let keyBlack = isBlack(note.noteNumber - 21)
		//TODO Clean up. Right now it returns more info than necessary to use in DebugRender..
		return {
			noteNumber: note.noteNumber,
			timestamp: note.timestamp,
			offTime: note.offTime,
			duration: note.duration,
			instrument: note.instrument,
			track: note.track,
			channel: note.channel,
			fillStyle: keyBlack
				? getTrackColor(note.track).black
				: getTrackColor(note.track).white,
			currentTime: time,
			keyBlack: keyBlack,
			noteDims: noteDims,
			isOn: isOn,
			noteDoneRatio: noteDoneRatio,
			rad: rad,
			x: noteDims.x + 1,
			y: noteDims.y,
			w: noteDims.w - 2,
			h: noteDims.h,
			sustainH: noteDims.sustainH,
			sustainY: noteDims.sustainY,
			velocity: note.velocity
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
			(height * this.renderDimensions.getNoteToHeightConst()) /
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
