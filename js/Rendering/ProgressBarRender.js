import { formatTime } from "../Util.js"
/**
 * Renders the progress bar of the song
 */
export class ProgressBarRender {
	constructor(ctx, renderDimensions) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
	}
	render(playerState) {
		this.ctx.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			this.renderDimensions.windowHeight
		)
		let ctx = this.ctx
		let progressPercent = playerState.time / (playerState.end / 1000)
		ctx.fillStyle = "rgba(80,80,80,0.8)"
		let ht =
			this.renderDimensions.windowHeight - this.renderDimensions.whiteKeyHeight
		ctx.fillRect(this.renderDimensions.windowWidth * progressPercent, 0, 2, 20)
		ctx.fillStyle = "rgba(50,150,50,0.8)"
		ctx.fillRect(0, 1, this.renderDimensions.windowWidth * progressPercent, 18)

		ctx.fillStyle = "rgba(0,0,0,1)"
		let text =
			formatTime(playerState.time) + "/" + formatTime(playerState.end / 1000)
		let wd = ctx.measureText(text).width
		ctx.font = "14px Arial black"
		ctx.fillText(text, this.renderDimensions.windowWidth / 2 - wd / 2, 15)
	}
}
