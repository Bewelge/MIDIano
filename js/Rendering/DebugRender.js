import { CONST } from "../CONST.js"
import { formatTime } from "../Util.js"

/**
 * Class to render some debug-info when mouse is hovered over a note.
 */
export class DebugRender {
	constructor(active, ctx, renderDimensions) {
		this.noteInfoBoxesToDraw = []
		this.active = active
		this.ctx = ctx
		this.renderDimensions = renderDimensions
	}
	addNote(note) {
		this.noteInfoBoxesToDraw.push(note)
	}
	render(renderInfos, mouseX, mouseY) {
		if (!this.active) return

		let amountOfNotesDrawn = 0
		renderInfos.forEach(renderInfo => {
			if (
				mouseX > renderInfo.x &&
				mouseX < renderInfo.x + renderInfo.w &&
				mouseY > renderInfo.y &&
				mouseY < renderInfo.y + renderInfo.h
			) {
				this.drawNoteInfoBox(renderInfo, mouseX, mouseY, amountOfNotesDrawn)
				amountOfNotesDrawn++
			}
		})
	}
	drawNoteInfoBox(note, mouseX, mouseY, amountOfNotesDrawn) {
		let c = this.ctx
		c.fillStyle = "white"
		c.font = "12px Arial black"
		c.textBaseline = "top"
		c.strokeStyle = note.fillStyle
		c.lineWidth = 4

		let lines = [
			"Note: " + CONST.NOTE_TO_KEY[note.noteNumber],
			"Start: " + formatTime(note.timestamp / 1000),
			"End: " + formatTime(note.offTime / 1000),
			"Duration: " + formatTime(note.duration / 1000),
			"Instrument: " + note.instrument,
			"Track: " + note.track,
			"Channel: " + note.channel
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
