import { getCurrentSong } from "../player/Player.js"
import { getSetting } from "../settings/Settings.js"

/**
 * Class to render the markers in the midi-song
 */
export class InSongTextRenderer {
	constructor(ctx, renderDimensions) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
	}
	render(time) {
		if (time > -0.7) return

		let c = this.ctx
		c.fillStyle = "rgba(255,255,255,0.8)"
		c.strokeStyle = "rgba(255,255,255,0.8)"
		c.font = "40px Arial black"
		c.textBaseline = "top"
		c.lineWidth = 1.5
		let text = getCurrentSong().name
		let y = this.renderDimensions.getYForTime(-700 - time * 1000)
		let txtWd = c.measureText(text).width
		c.fillText(text, this.renderDimensions.windowWidth / 2 - txtWd / 2, y + 3)
	}
}
