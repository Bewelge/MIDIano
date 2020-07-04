import { DomHelper } from "../DomHelper.js"
import { formatTime } from "../Util.js"
import { isBlack } from "./RenderUtil.js"
import { PianoRender } from "./PianoRender.js"
import { DebugRender } from "./DebugRender.js"
import { OverlayRender } from "./OverlayRender.js"

const DEBUG = true

const LOOK_BACK_TIME = 4
const LOOK_AHEAD_TIME = 10

const MIN_WIDTH = 1040
const MIN_HEIGHT = 560

export class Render {
	constructor(player) {
		this.windowWidth = Math.max(MIN_WIDTH, Math.floor(window.innerWidth))
		this.windowHeight = Math.max(MIN_HEIGHT, Math.floor(window.innerHeight))

		this.pianoRender = new PianoRender(this.windowWidth, this.windowHeight)
		this.setupCanvases()
		this.overlayRender = new OverlayRender(this.ctx)
		this.overlayRender.addOverlay("Javascript Midi-Player \n by Bewelge", 100)
		this.debugRender = new DebugRender(DEBUG, this.ctx)

		this.resize()

		this.particles = new Map()
		this.keyDimensions = []
		this.grabSpeed = 0

		this.mouseX = 0
		this.mouseY = 0

		this.playerState = player.getState()

		window.addEventListener("resize", this.resize.bind(this))
	}
	isOnMainCanvas(mouseEvent) {
		return (
			mouseEvent.clientY < this.windowHeight - this.pianoRender.whiteKeyHeight
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
	}
	/**
	 * Main rendering function
	 */
	render(playerState) {
		this.playerState = playerState
		this.ctx.clearRect(0, 0, this.windowWidth, this.windowHeight)
		this.progressBarCtx.clearRect(0, 0, this.windowWidth, this.windowHeight)
		this.pianoRender.clearPlayedKeysCanvases()
		let time = playerState.time

		if (!playerState.loading && playerState.song) {
			this.drawProgressBar(playerState)
			this.drawTempoLines(time)

			let song = playerState.song
			song.activeTracks.forEach((track, index) => {
				if (
					this.playerState.tracks[index] &&
					this.playerState.tracks[index].draw
				) {
					this.drawNotesInTimeWindow(time, track.notesBySeconds, index)
				}
			})
		}

		this.renderParticles()
		this.overlayRender.render()
		this.debugRender.render()
		this.updateParticles()
	}
	drawNotesInTimeWindow(time, notesBySeconds, index) {
		let lookBackTime = Math.floor(time - LOOK_BACK_TIME)
		let lookAheadTime = Math.ceil(time + LOOK_AHEAD_TIME)

		//sort by Black/white, so we have to only change fillstyle once.
		let notesRenderInfoBlack = []
		let notesRenderInfoWhite = []
		for (let i = lookBackTime; i < lookAheadTime; i++) {
			if (notesBySeconds[i]) {
				notesBySeconds[i]
					.slice(0)
					.filter(note => note.instrument != "percussion")
					.slice(0)
					.map(note => this.getRenderInfos(note, time))
					.forEach(renderInfo =>
						renderInfo.keyBlack
							? notesRenderInfoBlack.push(renderInfo)
							: notesRenderInfoWhite.push(renderInfo)
					)

				// .forEach(note => this.drawNote(note, time))
			}
		}
		let colWhite = this.getColor(index).white
		let colBlack = this.getColor(index).black

		let activeNotesBlack = notesRenderInfoBlack
			.slice(0)
			.filter(renderInfo => renderInfo.isOn)

		let activeNotesWhite = notesRenderInfoWhite
			.slice(0)
			.filter(renderInfo => renderInfo.isOn)

		this.ctx.fillStyle = colWhite
		activeNotesWhite.forEach(note => this.renderActiveKey(note))
		this.ctx.fillStyle = colBlack
		activeNotesBlack.forEach(note => this.renderActiveKey(note))

		this.ctx.fillStyle = colWhite
		notesRenderInfoWhite.forEach(renderInfo => this.drawNote(renderInfo))
		this.ctx.fillStyle = colBlack
		notesRenderInfoBlack.forEach(renderInfo => this.drawNote(renderInfo))

		this.ctx.fillStyle = colWhite
		activeNotesWhite.forEach(note =>
			this.pianoRender.drawActiveKey(note, colWhite)
		)
		this.ctx.fillStyle = colBlack
		activeNotesBlack.forEach(note =>
			this.pianoRender.drawActiveKey(note, colBlack)
		)

		activeNotesWhite.forEach(note =>
			this.createParticles(
				note.x,
				this.windowHeight -
					this.pianoRender.whiteKeyHeight +
					2 +
					Math.random() * 2,
				note.w,
				colWhite
			)
		)
		activeNotesBlack.forEach(note =>
			this.createParticles(
				note.x,
				this.windowHeight -
					this.pianoRender.whiteKeyHeight +
					2 +
					Math.random() * 2,
				note.w,
				colBlack
			)
		)

		// this.ctx.strokeStyle = "black"
		// this.ctx.lineWidth = 1
		// notesRenderInfoBlack.forEach(note => this.strokeNote(note))
		this.ctx.strokeStyle = "rgba(255,255,255,0.5)"
		this.ctx.lineWidth = 1
		activeNotesBlack.forEach(note => this.strokeNote(note))
		activeNotesWhite.forEach(note => this.strokeNote(note))
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

		this.drawBackground()
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
		ctx.fillStyle = "rgba(50,150,50,0.3)"
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
	drawActiveNote(note, time) {
		let color = keyBlack
			? this.getColor(note.track).black
			: this.getColor(note.track).white
		ctx.fillStyle = color
		ctx.globalAlpha = Math.max(0, 0.7 - noteDoneRatio)
		let wOffset = Math.pow(
			this.pianoRender.whiteKeyWidth / 2,
			1 + noteDoneRatio
		)
		this.createParticles(
			x - w / 2,
			this.windowHeight -
				this.pianoRender.whiteKeyHeight +
				2 +
				Math.random() * 2,
			w,
			ctx.fillStyle
		)
		this.drawRoundRect(
			ctx,
			x - wOffset / 2,
			y,
			w + wOffset,
			h,
			rad + rad * noteDoneRatio * 4
		)
		ctx.fill()
		ctx.globalAlpha = 1
		this.pianoRender.drawActiveKey(note, color)
		ctx.strokeStyle = "rgba(255,255,255,0.5)"
		ctx.lineWidth = 1.5
	}
	getRenderInfos(note, time) {
		time *= 1000
		let noteDims = this.getNoteDimensions(
			note.noteNumber,
			time,
			note.timestamp,
			note.offTime
		)
		let isOn = note.timestamp < time && note.offTime > time ? 1 : 0
		let noteDoneRatio = 1 - (note.offTime - time) / note.duration
		noteDoneRatio *= isOn
		let rad = (noteDims.w / 10) * (1 - noteDoneRatio)
		let keyBlack = isBlack(note.noteNumber - 21)
		return {
			noteNumber: note.noteNumber,
			fillStyle: keyBlack
				? this.getColor(note.track).black
				: this.getColor(note.track).white,
			currentTime: time,
			keyBlack: keyBlack,
			noteDims: noteDims,
			isOn: isOn,
			noteDoneRatio: noteDoneRatio,
			rad: rad,
			x: noteDims.x + rad + 1,
			y: noteDims.y,
			w: noteDims.w - rad * 2 - 2,
			h: noteDims.h
		}
	}
	strokeNote(renderInfo) {
		this.drawRoundRect(
			this.ctx,
			renderInfo.x,
			renderInfo.y,
			renderInfo.w,
			renderInfo.h,
			renderInfo.rad + renderInfo.rad * renderInfo.noteDoneRatio * 4
		)
		this.ctx.stroke()
	}
	/**
	 *
	 * @param {Object} renderInfos
	 */
	drawNote(renderInfos) {
		// if (
		// 	!this.playerState.tracks[note.track] ||
		// 	!this.playerState.tracks[note.track].draw
		// ) {
		// 	return
		// }
		let ctx = this.ctx

		let rad = renderInfos.rad
		let x = renderInfos.x
		let y = renderInfos.y
		let w = renderInfos.w
		let h = renderInfos.h

		ctx.strokeStyle = "rgba(0,0,0,1)"
		ctx.lineWidth = 1

		ctx.globalAlpha = Math.min(
			1,
			(y + h - this.menuHeight) /
				(this.windowHeight -
					this.pianoRender.whiteKeyHeight -
					this.menuHeight -
					60) /
				0.2
		)
		this.drawRoundRect(ctx, x, y, w, h, rad)
		ctx.fill()
		// let lgr = ctx.createLinearGradient(x, y, x + w, y + h)
		// lgr.addColorStop(0, "rgba(0,0,0,0.2)")
		// lgr.addColorStop(1, "rgba(255,255,255,0)")
		// ctx.fillStyle = lgr
		// ctx.fill()
		// lgr = ctx.createLinearGradient(x + w, y + h, x, y)
		// lgr.addColorStop(0, "rgba(0,0,0,0)")
		// lgr.addColorStop(1, "rgba(255,255,255,0.2)")
		// ctx.fillStyle = lgr
		// ctx.fill()

		// lgr = ctx.createLinearGradient(x + w / 2, y + h, x + w / 2, y + h - w * 1.2)
		// lgr.addColorStop(1, "rgba(0,0,0,0)")
		// lgr.addColorStop(0, "rgba(255,255,255,0.25)")
		// ctx.fillStyle = lgr
		// ctx.fill()
		ctx.globalAlpha = 1

		// if (
		// 	this.mouseX > x &&
		// 	this.mouseX < x + w &&
		// 	this.mouseY > y &&
		// 	this.mouseY < y + h
		// ) {
		// 	this.debugRender.addNote(note)
		// }

		ctx.stroke()
	}

	renderActiveKey(renderInfos) {
		let ctx = this.ctx
		ctx.globalAlpha = Math.max(0, 0.7 - renderInfos.noteDoneRatio)
		let wOffset = Math.pow(
			this.pianoRender.whiteKeyWidth / 2,
			1 + renderInfos.noteDoneRatio
		)
		this.drawRoundRect(
			ctx,
			renderInfos.x - wOffset / 2,
			renderInfos.y,
			renderInfos.w + wOffset,
			renderInfos.h,
			renderInfos.rad + renderInfos.rad * renderInfos.noteDoneRatio * 10
		)
		ctx.fill()
		ctx.globalAlpha = 1
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
	 * @param {Number} trackIndex
	 */
	getColor(trackIndex) {
		return this.playerState.tracks
			? this.playerState.tracks[trackIndex].color
			: "rgba(0,0,0,0)"
	}

	/**
	 *
	 * @param {Number} noteNumber
	 * @param {Number} currentTime
	 * @param {Number} noteStartTime
	 * @param {Number} noteEndTime
	 */
	getNoteDimensions(noteNumber, currentTime, noteStartTime, noteEndTime) {
		noteNumber -= 21
		const height = this.windowHeight - this.pianoRender.whiteKeyHeight

		const dur = noteEndTime - noteStartTime
		const keyBlack = isBlack(noteNumber)
		const x = this.pianoRender.getKeyX(noteNumber, keyBlack)

		const h =
			(dur / this.noteToHeightConst) *
			(this.windowHeight - this.pianoRender.whiteKeyHeight)
		const y =
			height -
			((noteEndTime - currentTime) / this.noteToHeightConst) *
				(this.windowHeight - this.pianoRender.whiteKeyHeight)
		return {
			x: x,
			y: y - 2,
			w: keyBlack
				? this.pianoRender.blackKeyWidth
				: this.pianoRender.whiteKeyWidth,
			h: h - 2,
			black: keyBlack
		}
	}

	/**
	 *
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 * @param {Number} radius
	 */
	drawRoundRect(ctx, x, y, width, height, radius) {
		// radius = radius * 2 < ( Math.min( height, width ) ) ? radius : ( Math.min( height, width ) ) / 2
		if (typeof radius === "undefined") {
			radius = 0
		}
		if (typeof radius === "number") {
			radius = {
				tl: radius,
				tr: radius,
				br: radius,
				bl: radius
			}
		} else {
			var defaultRadius = {
				tl: 0,
				tr: 0,
				br: 0,
				bl: 0
			}
			for (var side in defaultRadius) {
				radius[side] = radius[side] || defaultRadius[side]
			}
		}

		ctx.beginPath()
		ctx.moveTo(x + radius.tl, y)
		ctx.lineTo(x + width - radius.tr, y)
		ctx.lineTo(x + width, y + radius.tr)
		ctx.lineTo(x + width, y + height - radius.br)
		ctx.lineTo(x + width - radius.br, y + height)
		ctx.lineTo(x + radius.bl, y + height)
		ctx.lineTo(x, y + height - radius.bl)
		ctx.lineTo(x, y + radius.tl)
		ctx.lineTo(x + radius.tl, y)

		ctx.closePath()
	}
	/**
	 *
	 * @param {CanvasRenderingContext2D} ctxWhite
	 * @param {CanvasRenderingContext2D} ctxBlack
	 */

	createParticles(x, y, w, color) {
		for (let i = 0; i < Math.random() * 40; i++) {
			let rndX = x + w * Math.random() // / 2 - (w / 2) * (Math.random() - Math.random())

			let ang = Math.random() * Math.PI + Math.PI
			let radius = Math.random() * 2 + 0.5
			let motion = Math.random() * 3 + 0.5
			let angMotion = Math.random() * 0.05
			let lifeTime = Math.random() * 6 + 1
			this.createParticle(
				rndX,
				y,
				ang,
				radius,
				motion,
				angMotion,
				color,
				lifeTime
			)
		}
	}
	createParticle(x, y, ang, radius, motion, angMotion, color, lifeTime) {
		if (!this.particles.has(color)) {
			this.particles.set(color, [])
		}
		this.particles
			.get(color)
			.push([x, y, ang, radius, motion, angMotion, lifeTime])
	}
	updateParticles() {
		this.particles.forEach(particleArray =>
			particleArray.forEach(particle => this.updateParticle(particle))
		)
		this.particles.forEach((particleArray, color) => {
			for (let i = particleArray.length - 1; i >= 0; i--) {
				if (particleArray[i][6] < 0) {
					particleArray.splice(i, 1)
				}
			}

			if (particleArray.length == 0) {
				this.particles.delete(color)
			}
		})
	}
	updateParticle(particle) {
		particle[0] += Math.cos(particle[2]) * particle[4] //x
		particle[1] += Math.sin(particle[2]) * particle[4] //y

		particle[2] += particle[5]

		particle[4] *= 0.92
		particle[5] *= 0.92

		particle[6]--
	}
	renderParticles() {
		this.strokeStyle = "rgba(255,255,255,0.2)"

		this.particles.forEach((particleArray, color) => {
			this.ctx.fillStyle = color
			let c = this.ctx
			c.beginPath()
			particleArray.forEach(particle => this.renderParticle(particle))
			c.fill()
			c.closePath()
		})
	}
	renderParticle(particle) {
		this.ctx.moveTo(particle[0], particle[1])
		this.ctx.arc(particle[0], particle[1], particle[3], 0, Math.PI * 2, 0)
	}
}
