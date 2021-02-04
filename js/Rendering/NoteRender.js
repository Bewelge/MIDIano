import { getSetting } from "../settings/Settings.js"
import { isBlack, drawRoundRect } from "../Util.js"
import { ParticleRender } from "./ParticleRender.js"

/**
 * Class to render the notes on screen.
 */
export class NoteRender {
	constructor(ctx, renderDimensions, pianoRender) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
		this.pianoRender = pianoRender
		this.particleRender = new ParticleRender(this.ctx, this.renderDimensions)
	}
	render(time, renderInfoByTrackMap, inputActiveNotes) {
		this.particleRender.render()

		//sustained note "tails"
		if (getSetting("showSustainedNotes")) {
			this.drawSustainedNotes(renderInfoByTrackMap, time)
		}

		let activeNotesByTrackMap = this.getActiveNotesByTrackMap(
			renderInfoByTrackMap
		)
		//Active note effects
		Object.keys(renderInfoByTrackMap).forEach(trackIndex => {
			this.renderActiveNotesEffects(activeNotesByTrackMap[trackIndex])
		})

		//Notes
		Object.keys(renderInfoByTrackMap).forEach(trackIndex => {
			this.drawNotes(
				renderInfoByTrackMap[trackIndex].white,
				renderInfoByTrackMap[trackIndex].black
			)
		})
		//Active keys on piano + stroking of active notes
		Object.keys(renderInfoByTrackMap).forEach(trackIndex => {
			this.renderActivePianoKeys(activeNotesByTrackMap[trackIndex])

			this.strokeActiveNotes(activeNotesByTrackMap[trackIndex])
			this.createParticles(activeNotesByTrackMap[trackIndex])
		})

		for (let noteNumber in inputActiveNotes) {
			this.pianoRender.drawActiveInputKey(noteNumber, isBlack(noteNumber))
		}
	}

	drawSustainedNotes(renderInfoByTrackMap, time) {
		Object.keys(renderInfoByTrackMap).forEach(trackIndex => {
			let notesRenderInfoBlack = renderInfoByTrackMap[trackIndex].black
			let notesRenderInfoWhite = renderInfoByTrackMap[trackIndex].white

			this.ctx.globalAlpha = getSetting("sustainedNotesOpacity") / 100
			this.ctx.strokeStyle = "rgba(0,0,0,1)"
			this.ctx.lineWidth = 1
			if (notesRenderInfoWhite.length > 0) {
				this.ctx.fillStyle = notesRenderInfoWhite[0].fillStyle
			}
			notesRenderInfoWhite.forEach(renderInfo =>
				this.drawSustainedNote(renderInfo)
			)
			if (notesRenderInfoBlack.length > 0) {
				this.ctx.fillStyle = notesRenderInfoBlack[0].fillStyle
			}
			notesRenderInfoBlack.forEach(renderInfo =>
				this.drawSustainedNote(renderInfo)
			)
		})
	}

	drawSustainedNote(renderInfos) {
		let ctx = this.ctx

		let rad = renderInfos.rad
		let x = renderInfos.x
		let y = renderInfos.sustainY
		let w = renderInfos.w / 2
		let h = renderInfos.sustainH

		if (renderInfos.sustainH && renderInfos.sustainY) {
			// if (getSetting("roundedNotes") || getSetting("noteBorderRadius") > 0) {
			// 	drawRoundRect(ctx, x + w / 2, y, w, h, rad, getSetting("roundedNotes"))
			// } else {
			ctx.beginPath()
			ctx.rect(x + w / 2, renderInfos.sustainY, w, renderInfos.sustainH)
			ctx.closePath()
			// }
			ctx.fill()
		}
	}

	getActiveNotesByTrackMap(renderInfoByTrackMap) {
		return Object.keys(renderInfoByTrackMap).map(trackIndex =>
			this.getActiveNotes(
				renderInfoByTrackMap[trackIndex].black,
				renderInfoByTrackMap[trackIndex].white
			)
		)
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

	renderActiveNotesEffects(activeNotes) {
		if (getSetting("showHitKeys")) {
			if (activeNotes.white.length) {
				this.ctx.fillStyle = activeNotes.white[0].fillStyle
			}
			activeNotes.white.forEach(note => this.renderActiveNoteEffect(note))

			if (activeNotes.black.length) {
				this.ctx.fillStyle = activeNotes.black[0].fillStyle
			}
			activeNotes.black.forEach(note => this.renderActiveNoteEffect(note))
		}
	}

	renderActiveNoteEffect(renderInfos) {
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
				renderInfos.rad,
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

	drawNotes(notesRenderInfoWhite, notesRenderInfoBlack) {
		this.ctx.globalAlpha = 1
		this.ctx.strokeStyle = "rgba(0,0,0,1)"
		this.ctx.lineWidth = 1
		this.ctx.fillStyle = notesRenderInfoWhite.length
			? notesRenderInfoWhite[0].fillStyle
			: ""
		notesRenderInfoWhite.forEach(renderInfo => this.drawNote(renderInfo))
		this.ctx.fillStyle = notesRenderInfoBlack.length
			? notesRenderInfoBlack[0].fillStyle
			: ""
		notesRenderInfoBlack.forEach(renderInfo => this.drawNote(renderInfo))
	}
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
	renderActivePianoKeys(activeNotes) {
		if (getSetting("highlightActivePianoKeys")) {
			activeNotes.white.forEach(noteRenderInfo =>
				this.pianoRender.drawActiveKey(noteRenderInfo, noteRenderInfo.fillStyle)
			)
			activeNotes.black.forEach(noteRenderInfo =>
				this.pianoRender.drawActiveKey(noteRenderInfo, noteRenderInfo.fillStyle)
			)
		}
	}
	strokeActiveNotes(activeNotes) {
		this.ctx.strokeStyle = "rgba(255,255,255,0.5)"
		this.ctx.lineWidth = 1
		activeNotes.black.forEach(note => this.strokeNote(note))
		activeNotes.white.forEach(note => this.strokeNote(note))
	}

	strokeNote(renderInfo) {
		if (getSetting("roundedNotes") || getSetting("noteBorderRadius") > 0) {
			drawRoundRect(
				this.ctx,
				renderInfo.x,
				renderInfo.y,
				renderInfo.w,
				renderInfo.h,
				renderInfo.rad,
				getSetting("roundedNotes")
			)
		} else {
			this.ctx.beginPath()
			this.ctx.rect(renderInfo.x, renderInfo.y, renderInfo.w, renderInfo.h)
			this.ctx.closePath()
		}
		this.ctx.stroke()
	}

	createParticles(activeNotes, colWhite, colBlack) {
		if (getSetting("showParticles")) {
			activeNotes.white.forEach(noteRenderInfo =>
				this.particleRender.createParticles(
					noteRenderInfo.x,
					this.renderDimensions.windowHeight -
						this.renderDimensions.whiteKeyHeight +
						2 +
						Math.random() * 2,
					noteRenderInfo.w,
					noteRenderInfo.h,
					noteRenderInfo.fillStyle
				)
			)
			activeNotes.black.forEach(noteRenderInfo =>
				this.particleRender.createParticles(
					noteRenderInfo.x,
					this.renderDimensions.windowHeight -
						this.renderDimensions.whiteKeyHeight +
						2 +
						Math.random() * 2,
					noteRenderInfo.w,
					noteRenderInfo.h,
					noteRenderInfo.fillStyle
				)
			)
		}
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
	/**
	 * Sets Menu (Navbar) Height.  Required to calculate fadeIn alpha value
	 *
	 * @param {Number} menuHeight
	 */
	setMenuHeight(menuHeight) {
		this.menuHeight = menuHeight
	}
}
