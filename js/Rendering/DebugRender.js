import { CONST } from "../data/CONST.js"
import { getSetting } from "../settings/Settings.js"
import { formatTime } from "../Util.js"

/**
 * Class to render some general debug-info or when mouse is hovered over a note.
 */
export class DebugRender {
	constructor(active, ctx, renderDimensions) {
		this.noteInfoBoxesToDraw = []
		this.active = active
		this.ctx = ctx
		this.renderDimensions = renderDimensions

		this.fpsFilterStrength = 5
		this.frameTime = 0
		this.lastTimestamp = window.performance.now()
	}
	addNote(note) {
		this.noteInfoBoxesToDraw.push(note)
	}
	render(renderInfos, mouseX, mouseY, menuHeight) {
		this.thisTimestamp = window.performance.now()
		if (getSetting("showFps")) {
			let timePassed = this.thisTimestamp - this.lastTimestamp
			this.frameTime += (timePassed - this.frameTime) / this.fpsFilterStrength
			this.ctx.font = "20px Arial black"
			this.ctx.fillStyle = "rgba(255,255,255,0.8)"
			this.ctx.fillText(
				(1000 / this.frameTime).toFixed(0) + " FPS",
				20,
				menuHeight + 60
			)
		}

		this.lastTimestamp = this.thisTimestamp

		this.renderNoteDebugInfo(renderInfos, mouseX, mouseY)
	}
	renderNoteDebugInfo(renderInfos, mouseX, mouseY) {
		if (getSetting("showNoteDebugInfo")) {
			let amountOfNotesDrawn = 0
			Object.keys(renderInfos).forEach(trackIndex => {
				renderInfos[trackIndex].black
					.filter(renderInfo =>
						this.isMouseInRenderInfo(renderInfo, mouseX, mouseY)
					)
					.forEach(renderInfo => {
						this.drawNoteInfoBox(renderInfo, mouseX, mouseY, amountOfNotesDrawn)
						amountOfNotesDrawn++
					})
				renderInfos[trackIndex].white
					.filter(renderInfo =>
						this.isMouseInRenderInfo(renderInfo, mouseX, mouseY)
					)
					.forEach(renderInfo => {
						this.drawNoteInfoBox(renderInfo, mouseX, mouseY, amountOfNotesDrawn)
						amountOfNotesDrawn++
					})
			})
		}
	}
	isMouseInRenderInfo(renderInfo, mouseX, mouseY) {
		return (
			mouseX > renderInfo.x &&
			mouseX < renderInfo.x + renderInfo.w &&
			mouseY > renderInfo.y &&
			mouseY < renderInfo.y + renderInfo.h
		)
	}

	drawNoteInfoBox(renderInfo, mouseX, mouseY, amountOfNotesDrawn) {
		let c = this.ctx
		c.fillStyle = "white"
		c.font = "12px Arial black"
		c.textBaseline = "top"
		c.strokeStyle = renderInfo.fillStyle
		c.lineWidth = 4

		let lines = [
			"Note: " + CONST.MIDI_NOTE_TO_KEY[renderInfo.noteNumber],
			"NoteNumber: " + renderInfo.noteNumber,
			"MidiNoteNumber: " + renderInfo.midiNoteNumber,
			"Start: " + renderInfo.timestamp,
			"End: " + renderInfo.offTime,
			"Duration: " + renderInfo.duration,
			"Velocity: " + renderInfo.velocity,
			"Instrument: " + renderInfo.instrument,
			"Track: " + renderInfo.track,
			"Channel: " + renderInfo.channel
		]
		let left = mouseX > this.renderDimensions.windowWidth / 2 ? -160 : 60
		let top =
			mouseY > this.renderDimensions.windowHeight / 2
				? -10 - 14 * lines.length
				: 10

		top += amountOfNotesDrawn * lines.length * 15
		c.beginPath()
		c.moveTo(mouseX + left - 4, mouseY + top)
		c.lineTo(mouseX + left - 4, mouseY + top + lines.length * 14)
		c.stroke()
		for (let l in lines) {
			c.fillText(lines[l], mouseX + left, mouseY + top + 14 * l)
		}
	}
}
