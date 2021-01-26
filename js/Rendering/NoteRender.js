import { getSetting } from "../settings/Settings.js"
import { isBlack, drawRoundRect } from "../Util.js"
import { ParticleRender } from "./ParticleRender.js"

/**
 * Class to render the notes on screen.
 */
export class NoteRender {
	constructor(ctx, renderDimensions, pianoRender, lookBackTime, lookAheadTime) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
		this.pianoRender = pianoRender
		this.particleRender = new ParticleRender(this.ctx, this.renderDimensions)
		this.lookBackTime = lookBackTime
		this.lookAheadTime = lookAheadTime
	}
	render(playerState) {
		this.playerState = playerState
		let renderInfos = []

		this.particleRender.render()
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

		//return renderInfos for Debugrender..
		return renderInfos
	}
	/**
	 * Returns current time adjusten for the render-offset from the settings
	 * @param {Object} playerState
	 */
	getRenderTime(playerState) {
		return playerState.time + getSetting("renderOffset") / 1000
	}
	/**
	 * Sets Menu (Navbar) Height.  Required to calculate fadeIn alpha value
	 *
	 * @param {Number} menuHeight
	 */
	setMenuHeight(menuHeight) {
		this.menuHeight = menuHeight
	}
	/**
	 * Renders all notes in time window between lookBackTime and lookAheadTime
	 *
	 * @param {Number} time
	 * @param {Object} notesBySeconds
	 * @param {Integer} index
	 */
	drawNotesInTimeWindowAndReturnRenderInfos(time, notesBySeconds, index) {
		let lookBackTime = Math.floor(time - this.lookBackTime)
		let lookAheadTime = Math.ceil(
			time + this.renderDimensions.getSecondsDisplayed()
		)

		//sort by Black/white, so we only have to change fillstyle once.
		let notesRenderInfoBlack = []
		let notesRenderInfoWhite = []
		for (let i = lookBackTime; i < lookAheadTime; i++) {
			if (notesBySeconds[i]) {
				notesBySeconds[i]
					// .slice(0)
					// .filter(note => note.instrument != "percussion")
					// .slice(0)
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

		let activeNotes = this.getActiveNotes(
			notesRenderInfoBlack,
			notesRenderInfoWhite
		)

		this.renderActiveNoteEffects(activeNotes, colWhite, colBlack)
		this.createAndRenderParticles(activeNotes, colWhite, colBlack)
		if (getSetting("showSustainedNotes")) {
			this.renderSustainedNotes(
				notesRenderInfoWhite,
				notesRenderInfoBlack,
				colWhite,
				colBlack
			)
		}
		this.renderNotes(
			notesRenderInfoWhite,
			notesRenderInfoBlack,
			colWhite,
			colBlack
		)

		this.renderActivePianoKeys(activeNotes, colWhite, colBlack)

		this.strokeActiveNotes(activeNotes)

		return notesRenderInfoWhite.concat(notesRenderInfoBlack)
	}
	strokeActiveNotes(activeNotes) {
		this.ctx.strokeStyle = "rgba(255,255,255,0.5)"
		this.ctx.lineWidth = 1
		activeNotes.black.forEach(note => this.strokeNote(note))
		activeNotes.white.forEach(note => this.strokeNote(note))
	}

	createAndRenderParticles(activeNotes, colWhite, colBlack) {
		if (getSetting("showParticles")) {
			activeNotes.white.forEach(note =>
				this.particleRender.createParticles(
					note.x,
					this.renderDimensions.windowHeight -
						this.renderDimensions.whiteKeyHeight +
						2 +
						Math.random() * 2,
					note.w,
					note.h,
					colWhite
				)
			)
			activeNotes.black.forEach(note =>
				this.particleRender.createParticles(
					note.x,
					this.renderDimensions.windowHeight -
						this.renderDimensions.whiteKeyHeight +
						2 +
						Math.random() * 2,
					note.w,
					note.h,
					colBlack
				)
			)
		}
	}

	renderActivePianoKeys(activeNotes, colWhite, colBlack) {
		if (getSetting("showPianoKeys")) {
			this.ctx.fillStyle = colWhite
			activeNotes.white.forEach(note =>
				this.pianoRender.drawActiveKey(note, colWhite)
			)
			this.ctx.fillStyle = colBlack
			activeNotes.black.forEach(note =>
				this.pianoRender.drawActiveKey(note, colBlack)
			)
		}
	}

	renderSustainedNotes(
		notesRenderInfoWhite,
		notesRenderInfoBlack,
		colWhite,
		colBlack
	) {
		this.ctx.globalAlpha = getSetting("sustainedNotesOpacity") / 100
		this.ctx.strokeStyle = "rgba(0,0,0,1)"
		this.ctx.lineWidth = 1
		this.ctx.fillStyle = colWhite
		notesRenderInfoWhite.forEach(renderInfo =>
			this.drawSustainedNote(renderInfo)
		)
		this.ctx.fillStyle = colBlack
		notesRenderInfoBlack.forEach(renderInfo =>
			this.drawSustainedNote(renderInfo)
		)
	}
	renderNotes(notesRenderInfoWhite, notesRenderInfoBlack, colWhite, colBlack) {
		this.ctx.globalAlpha = 1
		this.ctx.strokeStyle = "rgba(0,0,0,1)"
		this.ctx.lineWidth = 1
		this.ctx.fillStyle = colWhite
		notesRenderInfoWhite.forEach(renderInfo => this.drawNote(renderInfo))
		this.ctx.fillStyle = colBlack
		notesRenderInfoBlack.forEach(renderInfo => this.drawNote(renderInfo))
	}

	renderActiveNoteEffects(activeNotes, colWhite, colBlack) {
		if (getSetting("showHitKeys")) {
			this.ctx.fillStyle = colWhite
			activeNotes.white.forEach(note => this.renderActiveNote(note))

			this.ctx.fillStyle = colBlack
			activeNotes.black.forEach(note => this.renderActiveNote(note))
		}
	}

	getActiveNotes(notesRenderInfoBlack, notesRenderInfoWhite) {
		let activeNotesBlack = notesRenderInfoBlack
			.slice(0)
			.filter(renderInfo => renderInfo.isOn)

		let activeNotesWhite = notesRenderInfoWhite
			.slice(0)
			.filter(renderInfo => renderInfo.isOn)
		return { white: activeNotesWhite, black: activeNotesBlack }
	}

	getRenderInfos(note, time) {
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
		// let rad = (noteDims.w / 10) * (1 - noteDoneRatio)
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
		if (getSetting("roundedNotes") || getSetting("noteBorderRadius") > 0) {
			drawRoundRect(
				this.ctx,
				renderInfo.x,
				renderInfo.y,
				renderInfo.w,
				renderInfo.h,
				renderInfo.rad + renderInfo.rad * renderInfo.noteDoneRatio * 4,
				getSetting("roundedNotes")
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
	drawSustainedNote(renderInfos) {
		let ctx = this.ctx

		let rad = renderInfos.rad + renderInfos.rad * renderInfos.noteDoneRatio * 4
		let x = renderInfos.x
		let y = renderInfos.y
		let w = renderInfos.w / 2
		let h = renderInfos.h

		if (renderInfos.sustainH && renderInfos.sustainY) {
			if (getSetting("roundedNotes") || getSetting("noteBorderRadius") > 0) {
				drawRoundRect(
					ctx,
					x + w / 2,
					renderInfos.sustainY,
					w,
					renderInfos.sustainH,
					rad,
					getSetting("roundedNotes")
				)
			} else {
				ctx.beginPath()
				ctx.rect(x, renderInfos.sustainY, w, renderInfos.sustainH)
				ctx.closePath()
			}
			ctx.fill()
		}
	}
	/**
	 *
	 * @param {Object} renderInfos
	 */
	drawNote(renderInfos) {
		let ctx = this.ctx

		let rad = renderInfos.rad
		let x = renderInfos.x
		let y = renderInfos.y
		let w = renderInfos.w
		let h = renderInfos.h

		let fadeInAlpha = 1
		if (getSetting("fadeInNotes")) {
			fadeInAlpha = this.getAlphaFromY(y + h)
		}

		ctx.globalAlpha = fadeInAlpha

		if (getSetting("roundedNotes") || getSetting("noteBorderRadius") > 0) {
			drawRoundRect(ctx, x, y, w, h, rad, getSetting("roundedNotes"))
		} else {
			ctx.beginPath()
			ctx.rect(x, y, w, h)
			ctx.closePath()
		}
		ctx.fill()

		if (!renderInfos.isOn && getSetting("strokeNotes")) {
			ctx.stroke()
		}
		ctx.globalAlpha = 1
	}

	getAlphaFromY(y) {
		return Math.min(
			1,
			Math.max(
				0,
				(y - this.menuHeight - 5) /
					((this.renderDimensions.windowHeight - this.menuHeight) * 0.5)
			)
		)
	}

	renderActiveNote(renderInfos) {
		let ctx = this.ctx
		ctx.globalAlpha = Math.max(0, 0.7 - renderInfos.noteDoneRatio)
		let wOffset = Math.pow(
			this.renderDimensions.whiteKeyWidth / 2,
			1 + renderInfos.noteDoneRatio
		)
		if (getSetting("roundedNotes") || getSetting("noteBorderRadius") > 0) {
			drawRoundRect(
				ctx,
				renderInfos.x - wOffset / 2,
				renderInfos.y,
				renderInfos.w + wOffset,
				renderInfos.h,
				renderInfos.rad + renderInfos.rad * renderInfos.noteDoneRatio * 10,
				getSetting("roundedNotes")
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
	 * @param {Number} trackIndex
	 */
	getColor(trackIndex) {
		return this.playerState.tracks
			? this.playerState.tracks[trackIndex].color
			: "rgba(0,0,0,0)"
	}
}
