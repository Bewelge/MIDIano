import { getSetting } from "../settings/Settings.js"
import { formatTime } from "../Util.js"
/**
 * Renders the progress bar of the song
 */
export class ProgressBarRender {
	constructor(ctx, renderDimensions) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
	}
	render(time, end) {
		this.ctx.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			this.renderDimensions.windowHeight
		)
		let ctx = this.ctx
		let progressPercent = time / (end / 1000)
		ctx.fillStyle = "rgba(80,80,80,0.8)"
		ctx.fillRect(this.renderDimensions.windowWidth * progressPercent, 0, 2, 20)
		ctx.fillStyle = "rgba(50,150,50,0.8)"
		ctx.fillRect(0, 0, this.renderDimensions.windowWidth * progressPercent, 20)

		ctx.fillStyle = "rgba(0,0,0,1)"
		let showMilis = getSetting("showMiliseconds")
		let text =
			formatTime(Math.min(time, end), showMilis) +
			" / " +
			formatTime(end / 1000, showMilis)
		let wd = ctx.measureText(text).width
		ctx.font = "14px Arial black"
		ctx.fillText(text, this.renderDimensions.windowWidth / 2 - wd / 2, 15)
	}
}
