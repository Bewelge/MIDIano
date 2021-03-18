import { DomHelper } from "../ui/DomHelper.js"
import { PianoRender } from "./PianoRender.js"
import { DebugRender } from "./DebugRender.js"
import { OverlayRender } from "./OverlayRender.js"
import { NoteRender } from "./NoteRender.js"
import { SustainRender } from "./SustainRenderer.js"
import { MarkerRenderer } from "./MarkerRenderer.js"
import { RenderDimensions } from "./RenderDimensions.js"
import { BackgroundRender } from "./BackgroundRender.js"
import { MeasureLinesRender } from "./MeasureLinesRender.js"
import { ProgressBarRender } from "./ProgressBarRender.js"
import { getSetting, setSettingCallback } from "../settings/Settings.js"
import { isBlack } from "../Util.js"
import { getTrackColor, isTrackDrawn } from "../player/Tracks.js"
import { getPlayerState } from "../player/Player.js"
import { InSongTextRenderer } from "./InSongTextRenderer.js"

const DEBUG = true

const DEFAULT_LOOK_BACK_TIME = 4
const LOOK_AHEAD_TIME = 10

const PROGRESS_BAR_CANVAS_HEIGHT = 20

/**
 * Class that handles all rendering
 */
export class Render {
	constructor() {
		this.renderDimensions = new RenderDimensions()
		this.renderDimensions.registerResizeCallback(this.setupCanvases.bind(this))

		setSettingCallback("particleBlur", this.setCtxBlur.bind(this))

		this.setupCanvases()

		this.pianoRender = new PianoRender(this.renderDimensions)

		this.overlayRender = new OverlayRender(this.ctx, this.renderDimensions)
		// this.addStartingOverlayMessage()

		this.debugRender = new DebugRender(DEBUG, this.ctx, this.renderDimensions)
		this.noteRender = new NoteRender(
			this.ctx,
			this.ctxForeground,
			this.renderDimensions,
			this.pianoRender
		)
		this.sustainRender = new SustainRender(this.ctx, this.renderDimensions)
		this.markerRender = new MarkerRenderer(this.ctx, this.renderDimensions)
		this.inSongTextRender = new InSongTextRenderer(
			this.ctx,
			this.renderDimensions
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

		this.playerState = getPlayerState()

		this.showKeyNamesOnPianoWhite = getSetting("showKeyNamesOnPianoWhite")
		this.showKeyNamesOnPianoBlack = getSetting("showKeyNamesOnPianoBlack")
	}

	setCtxBlur() {
		let blurPx = parseInt(getSetting("particleBlur"))
		if (blurPx == 0) {
			this.ctxForeground.filter = "none"
		} else {
			this.ctxForeground.filter = "blur(" + blurPx + "px)"
		}
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
		this.ctxForeground.clearRect(
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

		if (
			this.renderDimensions.pianoPositionY !=
			parseInt(getSetting("pianoPosition"))
		) {
			this.renderDimensions.pianoPositionY = parseInt(
				getSetting("pianoPosition")
			)
			this.pianoRender.repositionCanvases()
		}
		this.backgroundRender.renderIfColorsChanged()

		let renderInfosByTrackMap = this.getRenderInfoByTrackMap(playerState)
		let inputActiveRenderInfos = this.getInputActiveRenderInfos(playerState)
		let inputPlayedRenderInfos = this.getInputPlayedRenderInfos(playerState)
		const time = this.getRenderTime(playerState)
		const end = playerState.end
		if (!playerState.loading && playerState.song) {
			const measureLines = playerState.song
				? playerState.song.getMeasureLines()
				: []

			this.progressBarRender.render(time, end, playerState.song.markers)
			this.measureLinesRender.render(time, measureLines)
			this.sustainRender.render(
				time,
				playerState.song.sustainsBySecond,
				playerState.song.sustainPeriods
			)

			this.noteRender.render(
				time,
				renderInfosByTrackMap,
				inputActiveRenderInfos,
				inputPlayedRenderInfos
			)
			this.markerRender.render(time, playerState.song.markers)
			this.inSongTextRender.render(time, playerState.song.markers)
		}

		this.overlayRender.render()

		this.debugRender.render(
			renderInfosByTrackMap,
			this.mouseX,
			this.mouseY,
			this.renderDimensions.menuHeight
		)

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
					if (isTrackDrawn(trackIndex)) {
						renderInfoByTrackMap[trackIndex] = { black: [], white: [] }

						let time = this.getRenderTime(playerState)
						let firstSecondShown = Math.floor(
							time - this.renderDimensions.getSecondsDisplayedAfter() - 4
						)
						let lastSecondShown = Math.ceil(
							time + this.renderDimensions.getSecondsDisplayedBefore()
						)

						for (let i = firstSecondShown; i < lastSecondShown; i++) {
							if (track.notesBySeconds[i]) {
								track.notesBySeconds[i]
									// .filter(note => note.instrument != "percussion")
									.map(note => this.getNoteRenderInfo(note, time))
									.forEach(renderInfo =>
										renderInfo.isBlack
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
	getInputActiveRenderInfos(playerState) {
		let inputRenderInfos = []
		for (let key in playerState.inputActiveNotes) {
			let activeInputNote = playerState.inputActiveNotes[key]
			inputRenderInfos.push(
				this.getNoteRenderInfo(
					{
						timestamp: activeInputNote.timestamp,
						noteNumber: activeInputNote.noteNumber,
						offTime: playerState.ctxTime * 1000 + 0,
						duration: playerState.ctxTime * 1000 - activeInputNote.timestamp,
						velocity: 127,
						fillStyle: getSetting("inputNoteColor")
					},
					playerState.ctxTime
				)
			)
		}
		return inputRenderInfos
	}
	getInputPlayedRenderInfos(playerState) {
		let inputRenderInfos = []
		for (let key in playerState.inputPlayedNotes) {
			let playedInputNote = playerState.inputPlayedNotes[key]
			inputRenderInfos.push(
				this.getNoteRenderInfo(
					{
						timestamp: playedInputNote.timestamp,
						noteNumber: playedInputNote.noteNumber,
						offTime: playedInputNote.offTime,
						duration: playerState.ctxTime * 1000 - playedInputNote.timestamp,
						velocity: 127,
						fillStyle: getSetting("inputNoteColor")
					},
					playerState.ctxTime
				)
			)
		}
		return inputRenderInfos
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
		let elapsedTime = Math.max(0, time - note.timestamp)
		let noteDoneRatio = elapsedTime / note.duration

		let isKeyBlack = isBlack(note.noteNumber)
		//TODO Clean up. Right now it returns more info than necessary to use in DebugRender..
		return {
			noteNumber: note.noteNumber,
			timestamp: note.timestamp,
			offTime: note.offTime,
			duration: note.duration,
			instrument: note.instrument,
			track: note.track,
			channel: note.channel,
			fillStyle: note.fillStyle
				? note.fillStyle
				: isKeyBlack
				? getTrackColor(note.track).black
				: getTrackColor(note.track).white,
			currentTime: time,
			isBlack: isKeyBlack,
			noteDims: noteDims,
			isOn: isOn,
			noteDoneRatio: noteDoneRatio,
			rad: noteDims.rad,
			x: noteDims.x + 1,
			y: noteDims.y,
			w: noteDims.w - 2,
			h: noteDims.h,
			sustainH: noteDims.sustainH,
			sustainY: noteDims.sustainY,
			velocity: note.velocity,
			noteId: note.id
		}
	}

	drawBPM(playerState) {
		this.ctx.font = "20px Arial black"
		this.ctx.fillStyle = "rgba(255,255,255,0.8)"
		this.ctx.textBaseline = "top"
		this.ctx.fillText(
			Math.round(playerState.bpm) + " BPM",
			20,
			this.renderDimensions.menuHeight + PROGRESS_BAR_CANVAS_HEIGHT + 12
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

		DomHelper.setCanvasSize(
			this.getForegroundCanvas(),
			this.renderDimensions.windowWidth,
			this.renderDimensions.windowHeight
		)
		this.setCtxBlur()
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
	getForegroundCanvas() {
		if (!this.cnvForeground) {
			this.cnvForeground = DomHelper.createCanvas(
				this.renderDimensions.windowWidth,
				this.renderDimensions.windowHeight,
				{
					position: "absolute",
					top: "0px",
					left: "0px"
				}
			)
			this.cnvForeground.style.pointerEvents = "none"
			this.cnvForeground.style.zIndex = "101"
			document.body.appendChild(this.cnvForeground)
			this.ctxForeground = this.cnvForeground.getContext("2d")
		}
		return this.cnvForeground
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
			(position.x > this.renderDimensions.menuHeight &&
				position.y < this.renderDimensions.getAbsolutePianoPosition()) ||
			position.y >
				this.renderDimensions.getAbsolutePianoPosition() +
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
		this.renderDimensions.menuHeight = menuHeight
		this.pianoRender.repositionCanvases()
		this.getProgressBarCanvas().style.top = menuHeight + "px"
		this.noteRender.setMenuHeight(menuHeight)
	}
}
