import { isBlack, drawRoundRect } from "../Util.js"

import { ParticleRender } from "./ParticleRender.js"

export class NoteRender {
	constructor(ctx, pianoRender, lookBackTime, lookAheadTime) {
		this.pianoRender = pianoRender
		this.ctx = ctx
		this.particleRender = new ParticleRender(this.ctx)
		this.lookBackTime = lookBackTime
		this.lookAheadTime = lookAheadTime
	}
	render(playerState, settings) {
		this.playerState = playerState
		this.settings = settings
		let renderInfos = []

		if (playerState)
			if (playerState.song) {
				playerState.song.activeTracks.forEach((track, trackIndex) => {
					if (
						this.playerState.tracks[trackIndex] &&
						this.playerState.tracks[trackIndex].draw
					) {
						this.drawNotesInTimeWindowAndReturnRenderInfos(
							this.getRenderTime(playerState),
							track.notesBySeconds,
							trackIndex
						).forEach(renderInfo => renderInfos.push(renderInfo))
					}
				})
			}

		for (let noteNumber in playerState.inputActiveNotes) {
			this.pianoRender.drawActiveInputKey(noteNumber, isBlack(noteNumber))
		}

		this.particleRender.render(settings)

		//return renderInfos for Debugrender..
		return renderInfos
	}
	getRenderTime(playerState) {
		return playerState.time + this.settings.renderOffset / 1000
	}
	resize(windowWidth, windowHeight, noteToHeightConst) {
		this.windowWidth = windowWidth
		this.windowHeight = windowHeight
		this.noteToHeightConst = noteToHeightConst
	}
	setMenuHeight(menuHeight) {
		this.menuHeight = menuHeight
	}
	drawNotesInTimeWindowAndReturnRenderInfos(time, notesBySeconds, index) {
		let lookBackTime = Math.floor(time - this.lookBackTime)
		let lookAheadTime = Math.ceil(time + this.lookAheadTime)

		//sort by Black/white, so we only have to change fillstyle once.
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

		if (this.settings.showHitKeys) {
			this.ctx.fillStyle = colWhite
			activeNotesWhite.forEach(note => this.renderActiveNote(note))
			this.ctx.fillStyle = colBlack
			activeNotesBlack.forEach(note => this.renderActiveNote(note))
		}
		this.ctx.globalAlpha = 1
		this.ctx.strokeStyle = "rgba(0,0,0,1)"
		this.ctx.lineWidth = 1
		this.ctx.fillStyle = colWhite
		notesRenderInfoWhite.forEach(renderInfo => this.drawNote(renderInfo))
		this.ctx.fillStyle = colBlack
		notesRenderInfoBlack.forEach(renderInfo => this.drawNote(renderInfo))

		if (this.settings.showPianoKeys) {
			this.ctx.fillStyle = colWhite
			activeNotesWhite.forEach(note =>
				this.pianoRender.drawActiveKey(note, colWhite)
			)
			this.ctx.fillStyle = colBlack
			activeNotesBlack.forEach(note =>
				this.pianoRender.drawActiveKey(note, colBlack)
			)
		}

		if (this.settings && this.settings.showParticles) {
			activeNotesWhite.forEach(note =>
				this.particleRender.createParticles(
					note.x,
					this.windowHeight -
						this.pianoRender.whiteKeyHeight +
						2 +
						Math.random() * 2,
					note.w,
					note.h,
					colWhite
				)
			)
			activeNotesBlack.forEach(note =>
				this.particleRender.createParticles(
					note.x,
					this.windowHeight -
						this.pianoRender.whiteKeyHeight +
						2 +
						Math.random() * 2,
					note.w,
					note.h,
					colBlack
				)
			)
		}

		this.ctx.strokeStyle = "rgba(255,255,255,0.5)"
		this.ctx.lineWidth = 1
		activeNotesBlack.forEach(note => this.strokeNote(note))
		activeNotesWhite.forEach(note => this.strokeNote(note))

		return notesRenderInfoWhite.concat(notesRenderInfoBlack)
	}
	getRenderInfos(note, time) {
		time *= 1000
		let noteDims = this.getNoteDimensions(
			note.noteNumber,
			time,
			note.timestamp,
			note.offTime,
			note.sustainEndTime
		)
		let isOn = note.timestamp < time && note.offTime > time ? 1 : 0
		let noteDoneRatio = 1 - (note.offTime - time) / note.duration
		noteDoneRatio *= isOn
		let rad = (noteDims.w / 10) * (1 - noteDoneRatio)
		if (noteDims.h < rad * 2) {
			let diff = rad - noteDims.h
			rad = noteDims.h / 4
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
				? this.getColor(note.track).black
				: this.getColor(note.track).white,
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
			sustainY: noteDims.sustainY
		}
	}
	strokeNote(renderInfo) {
		if (this.settings.roundedNotes) {
			drawRoundRect(
				this.ctx,
				renderInfo.x,
				renderInfo.y,
				renderInfo.w,
				renderInfo.h,
				renderInfo.rad + renderInfo.rad * renderInfo.noteDoneRatio * 4
			)
		} else {
			this.ctx.beginPath()
			this.ctx.rect(renderInfo.x, renderInfo.y, renderInfo.w, renderInfo.h)
			this.ctx.closePath()
		}
		this.ctx.stroke()
	}
	/**
	 *
	 * @param {Object} renderInfos
	 */
	drawNote(renderInfos) {
		let ctx = this.ctx

		let rad = renderInfos.rad + renderInfos.rad * renderInfos.noteDoneRatio * 4
		let x = renderInfos.x
		let y = renderInfos.y
		let w = renderInfos.w
		let h = renderInfos.h

		let fadeInAlpha = 1
		if (this.settings.fadeInNotes) {
			fadeInAlpha = this.getAlphaFromHeight(y, h)
		}

		if (
			renderInfos.sustainH &&
			renderInfos.sustainY &&
			this.settings.showSustainedNotes
		) {
			ctx.globalAlpha =
				(fadeInAlpha * this.settings.sustainedNotesOpacity) / 100
			if (this.settings.roundedNotes) {
				drawRoundRect(
					ctx,
					x,
					renderInfos.sustainY,
					w,
					renderInfos.sustainH,
					rad
				)
			} else {
				ctx.beginPath()
				ctx.rect(x, renderInfos.sustainY, w, renderInfos.sustainH)
				ctx.closePath()
			}
			ctx.fill()
			ctx.globalAlpha = fadeInAlpha
		}

		if (this.settings.roundedNotes) {
			drawRoundRect(ctx, x, y, w, h, rad)
		} else {
			ctx.beginPath()
			ctx.rect(x, y, w, h)
			ctx.closePath()
		}
		ctx.fill()

		if (!renderInfos.isOn && this.settings.strokeNotes) {
			ctx.stroke()
		}
		ctx.globalAlpha = 1
	}

	getAlphaFromHeight(y, h) {
		return Math.min(
			1,
			(y + h - this.menuHeight) /
				(this.windowHeight -
					this.pianoRender.whiteKeyHeight -
					this.menuHeight) /
				0.5
		)
	}

	renderActiveNote(renderInfos) {
		let ctx = this.ctx
		ctx.globalAlpha = Math.max(0, 0.7 - renderInfos.noteDoneRatio)
		let wOffset = Math.pow(
			this.pianoRender.whiteKeyWidth / 2,
			1 + renderInfos.noteDoneRatio
		)
		if (this.settings.roundedNotes) {
			drawRoundRect(
				ctx,
				renderInfos.x - wOffset / 2,
				renderInfos.y,
				renderInfos.w + wOffset,
				renderInfos.h,
				renderInfos.rad + renderInfos.rad * renderInfos.noteDoneRatio * 10
			)
		} else {
			ctx.beginPath()
			ctx.rect(
				renderInfos.x - wOffset / 2,
				renderInfos.y,
				renderInfos.w + wOffset,
				renderInfos.h
			)
			ctx.closePath()
		}
		ctx.fill()
		ctx.globalAlpha = 1
	}

	/**
	 *
	 * @param {Number} noteNumber
	 * @param {Number} currentTime
	 * @param {Number} noteStartTime
	 * @param {Number} noteEndTime
	 */
	getNoteDimensions(
		noteNumber,
		currentTime,
		noteStartTime,
		noteEndTime,
		sustainEndTime
	) {
		noteNumber -= 21

		const dur = noteEndTime - noteStartTime
		const keyBlack = isBlack(noteNumber)
		const x = this.pianoRender.getKeyX(noteNumber, keyBlack)

		const h =
			(dur / this.noteToHeightConst) *
			(this.windowHeight - this.pianoRender.whiteKeyHeight)
		const y = this.getYForTime(noteEndTime - currentTime)

		let sustainY = 0
		let sustainH = 0
		if (sustainEndTime > noteEndTime) {
			sustainH =
				((sustainEndTime - noteStartTime) / this.noteToHeightConst) *
				(this.windowHeight - this.pianoRender.whiteKeyHeight)
			sustainY = this.getYForTime(sustainEndTime - currentTime)
		}

		return {
			x: x,
			y: y + 1,
			w: keyBlack
				? this.pianoRender.blackKeyWidth
				: this.pianoRender.whiteKeyWidth,
			h: h - 2,
			sustainH: sustainH,
			sustainY: sustainY,
			black: keyBlack
		}
	}

	getYForTime(time) {
		const height = this.windowHeight - this.pianoRender.whiteKeyHeight
		return height - (time / this.noteToHeightConst) * height
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
}
