import { CONST } from "../CONST.js"
import { formatTime } from "../Util.js"

export class DebugRender {
	constructor(active, ctx) {
		this.noteInfoBoxesToDraw = []
		this.active = active
		this.ctx = ctx
	}
	resize(windowWidth, windowHeight) {
		this.windowWidth = windowWidth
		this.windowHeight = windowHeight
	}
	addNote(note) {
		this.noteInfoBoxesToDraw.push(note)
	}
	render() {
		if (!this.active) return

		for (let i in this.noteInfoBoxesToDraw) {
			this.drawNoteInfoBox(this.noteInfoBoxesToDraw[i])
		}
		this.noteInfoBoxesToDraw = []
	}
	drawNoteInfoBox(note) {
		let c = this.ctx
		c.fillStyle = "white"
		c.font = "12px Arial black"
		c.textBaseline = "top"
		let lines = [
			"Note: " + CONST.NOTE_TO_KEY[note.noteNumber],
			"Start: " + formatTime(note.timestamp / 1000),
			"End: " + formatTime(note.offTime / 1000),
			"Duration: " + formatTime(note.duration / 1000),
			"Instrument: " + note.instrument,
			"Track: " + note.track,
			"Channel: " + note.channel
		]
		let left = this.mouseX > this.windowWidth / 2 ? -160 : 60
		let top = this.mouseY > this.windowHeight / 2 ? -10 - 14 * lines.length : 10
		for (let l in lines) {
			c.fillText(lines[l], this.mouseX + left, this.mouseY + top + 14 * l)
		}
	}
}
