import { getSetting } from "../settings/Settings.js"
import { drawRoundRect } from "../Util.js"
import { NoteParticleRender } from "./NoteParticleRender.js"
import { PianoParticleRender } from "./PianoParticleRender.js"

/**
 * Class to render the notes on screen.
 */
export class NoteRender {
	constructor(ctx, ctxForeground, renderDimensions, pianoRender) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
		this.ctxForeground = ctxForeground
		this.pianoRender = pianoRender
		this.lastActiveNotes = {}
		this.noteParticleRender = new NoteParticleRender(
			this.ctx,
			this.renderDimensions
		)
		this.pianoParticleRender = new PianoParticleRender(
			this.ctxForeground,
			this.renderDimensions
		)
	}
	render(time, renderInfoByTrackMap, inputActiveNotes, inputPlayedNotes) {
		this.noteParticleRender.render()

		//sustained note "tails"
		if (getSetting("showSustainedNotes")) {
			this.drawSustainedNotes(renderInfoByTrackMap, time)
		}

		let activeNotesByTrackMap = this.getActiveNotesByTrackMap(
			renderInfoByTrackMap
		)
		//Active note effects
		Object.keys(activeNotesByTrackMap).forEach(trackIndex => {
			this.renderActiveNotesEffects(activeNotesByTrackMap[trackIndex])
		})

		//Notes
		Object.keys(renderInfoByTrackMap).forEach(trackIndex => {
			this.drawNotes(
				renderInfoByTrackMap[trackIndex].white,
				renderInfoByTrackMap[trackIndex].black
			)
		})
		let currentActiveNotes = {}
		//Active keys on piano + stroking of active notes
		Object.keys(activeNotesByTrackMap).forEach(trackIndex => {
			this.renderActivePianoKeys(
				activeNotesByTrackMap[trackIndex],
				currentActiveNotes
			)

			this.strokeActiveNotes(activeNotesByTrackMap[trackIndex])
			this.createNoteParticles(activeNotesByTrackMap[trackIndex])
		})
		this.pianoParticleRender.render(this.ctxForeground)

		this.lastActiveNotes = currentActiveNotes

		this.drawInputNotes(inputActiveNotes, inputPlayedNotes)
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

		let x = renderInfos.x
		let w = renderInfos.w / 2

		if (renderInfos.sustainH && renderInfos.sustainY) {
			ctx.beginPath()
			ctx.rect(x + w / 2, renderInfos.sustainY, w, renderInfos.sustainH)
			ctx.closePath()
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
		ctx.globalAlpha = Math.max(
			0,
			0.7 - Math.min(0.7, renderInfos.noteDoneRatio)
		)
		let wOffset = Math.pow(
			this.renderDimensions.whiteKeyWidth / 2,
			1 + Math.min(1, renderInfos.noteDoneRatio) * renderInfos.isOn
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
		this.ctx.strokeStyle = getSetting("strokeNotesColor")
		this.ctx.lineWidth = getSetting("strokeNotesWidth")
		this.ctx.fillStyle = notesRenderInfoWhite.length
			? notesRenderInfoWhite[0].fillStyle
			: ""
		notesRenderInfoWhite.forEach(renderInfo => this.drawNote(renderInfo))
		this.ctx.fillStyle = notesRenderInfoBlack.length
			? notesRenderInfoBlack[0].fillStyle
			: ""
		notesRenderInfoBlack.forEach(renderInfo => this.drawNote(renderInfo))
	}

	drawInputNotes(inputActiveNotes, inputPlayedNotes) {
		this.ctx.globalAlpha = 1
		this.ctx.strokeStyle = getSetting("strokeNotesColor")
		this.ctx.lineWidth = getSetting("strokeNotesWidth")
		this.ctx.fillStyle = getSetting("inputNoteColor")
		let whiteActive = inputActiveNotes.filter(noteInfo => !noteInfo.isBlack)
		inputActiveNotes.forEach(noteInfo => {
			this.pianoRender.drawActiveInputKey(
				parseInt(noteInfo.noteNumber),
				this.ctx.fillStyle
			)
			this.drawNoteAfter(noteInfo)
			this.ctx.fill()
		})
		inputPlayedNotes.forEach(noteInfo => {
			// noteInfo.y += this.renderDimensions.whiteKeyHeight
			this.drawNoteAfter(noteInfo)
			this.ctx.fill()
		})
	}
	drawNote(renderInfos) {
		let ctx = this.ctx

		if (renderInfos.w <= 0 || renderInfos.h <= 0) {
			return
		}

		let fadeInAlpha = 1
		if (getSetting("fadeInNotes")) {
			fadeInAlpha = this.getAlphaFromY(renderInfos.y + renderInfos.h)
		}

		ctx.globalAlpha = fadeInAlpha

		if (renderInfos.noteDoneRatio < 1) {
			this.drawNoteBefore(renderInfos)
			ctx.fill()
			if (!renderInfos.isOn && getSetting("strokeNotes")) {
				ctx.stroke()
			}
		}

		if (getSetting("pianoPosition") != 0 && renderInfos.noteDoneRatio > 0) {
			this.drawNoteAfter(renderInfos)
			ctx.fill()
			if (!renderInfos.isOn && getSetting("strokeNotes")) {
				ctx.stroke()
			}
		}

		ctx.globalAlpha = 1
	}
	drawNoteAfter(renderInfos) {
		let ctx = this.ctx
		let y = Math.max(
			renderInfos.y + this.renderDimensions.whiteKeyHeight,
			this.renderDimensions.getAbsolutePianoPosition()
		)
		let h =
			renderInfos.h -
			(y - (renderInfos.y + this.renderDimensions.whiteKeyHeight))

		this.doNotePath(renderInfos, {
			y,
			h
		})
	}

	drawNoteBefore(renderInfos) {
		let ctx = this.ctx
		let h = Math.min(
			renderInfos.h,
			this.renderDimensions.getAbsolutePianoPosition() - renderInfos.y
		)
		this.doNotePath(renderInfos, { h })
	}

	renderActivePianoKeys(activeNotes, currentActiveNotes) {
		if (getSetting("highlightActivePianoKeys")) {
			activeNotes.white.forEach(noteRenderInfo => {
				this.pianoRender.drawActiveKey(noteRenderInfo, noteRenderInfo.fillStyle)
			})
			activeNotes.black.forEach(noteRenderInfo => {
				this.pianoRender.drawActiveKey(noteRenderInfo, noteRenderInfo.fillStyle)
			})

			//stroke newly hit ones
			//TODO: Doesn't look very nice.
			// activeNotes.white.forEach(noteRenderInfo => {
			// 	currentActiveNotes[noteRenderInfo.noteId] = true
			// 	if (!this.lastActiveNotes.hasOwnProperty(noteRenderInfo.noteId)) {
			// 		this.pianoParticleRender.add(noteRenderInfo)
			// 	}
			// })
			// activeNotes.black.forEach(noteRenderInfo => {
			// 	currentActiveNotes[noteRenderInfo.noteId] = true
			// 	if (!this.lastActiveNotes.hasOwnProperty(noteRenderInfo.noteId)) {
			// 		this.pianoParticleRender.add(noteRenderInfo)
			// 	}
			// })
		}
	}
	strokeActiveNotes(activeNotes) {
		if (getSetting("strokeActiveNotes")) {
			this.ctx.strokeStyle = getSetting("strokeActiveNotesColor")
			this.ctx.lineWidth = getSetting("strokeActiveNotesWidth")
			activeNotes.black.forEach(note => this.strokeNote(note))
			activeNotes.white.forEach(note => this.strokeNote(note))
		}
	}

	strokeNote(renderInfo) {
		this.drawNoteBefore(renderInfo)
		this.ctx.stroke()

		if (renderInfo.isOn) {
			this.drawNoteAfter(renderInfo)
			this.ctx.stroke()
		}
	}

	doNotePath(renderInfo, overWriteParams) {
		if (!overWriteParams) {
			overWriteParams = {}
		}
		for (let key in renderInfo) {
			if (!overWriteParams.hasOwnProperty(key)) {
				overWriteParams[key] = renderInfo[key]
			}
		}
		if (getSetting("roundedNotes") || getSetting("noteBorderRadius") > 0) {
			drawRoundRect(
				this.ctx,
				overWriteParams.x,
				overWriteParams.y,
				overWriteParams.w,
				overWriteParams.h,
				overWriteParams.rad,
				getSetting("roundedNotes")
			)
		} else {
			this.ctx.beginPath()
			this.ctx.rect(
				overWriteParams.x,
				overWriteParams.y,
				overWriteParams.w,
				overWriteParams.h
			)
			this.ctx.closePath()
		}
	}

	createNoteParticles(activeNotes, colWhite, colBlack) {
		if (getSetting("showParticles")) {
			activeNotes.white.forEach(noteRenderInfo =>
				this.noteParticleRender.createParticles(
					noteRenderInfo.x,
					this.renderDimensions.getAbsolutePianoPosition() + 2 * Math.random(),
					noteRenderInfo.w,
					noteRenderInfo.h,
					noteRenderInfo.fillStyle
				)
			)
			activeNotes.black.forEach(noteRenderInfo =>
				this.noteParticleRender.createParticles(
					noteRenderInfo.x,
					this.renderDimensions.getAbsolutePianoPosition() + 2 * Math.random(),
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
