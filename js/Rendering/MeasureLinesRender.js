/**
 * Class to render measure lines on the main canvas.
 */
export class MeasureLinesRender {
	constructor(ctx, renderDimensions) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
	}
	render(playerState) {
		let currentTime = playerState.time
		let measureLines = playerState.song
			? playerState.song.getMeasureLines()
			: []
		let ctx = this.ctx

		ctx.strokeStyle = "rgba(255,255,255,0.3)"

		ctx.lineWidth = 0.5
		let currentSecond = Math.floor(currentTime)
		ctx.beginPath()
		for (
			let i = currentSecond;
			i < currentSecond + this.renderDimensions.getSecondsDisplayed() + 1;
			i++
		) {
			if (!measureLines[i]) {
				continue
			}
			measureLines[i].forEach(tempoLine => {
				let ht = this.renderDimensions.getYForTime(
					tempoLine - currentTime * 1000
				)

				ctx.moveTo(0, ht)
				ctx.lineTo(this.renderDimensions.windowWidth, ht)
			})
		}
		ctx.closePath()
		ctx.stroke()
	}
}
