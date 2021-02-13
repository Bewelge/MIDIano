/**
 * Class to render measure lines on the main canvas.
 */
export class MeasureLinesRender {
	constructor(ctx, renderDimensions) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
	}
	render(time, measureLines) {
		let ctx = this.ctx

		ctx.strokeStyle = "rgba(255,255,255,0.3)"

		ctx.lineWidth = 0.5
		let currentSecond = Math.floor(time)
		ctx.beginPath()
		let firstSecondShown =
			currentSecond - this.renderDimensions.getSecondsDisplayedAfter() - 1
		let lastSecondShown =
			currentSecond + this.renderDimensions.getSecondsDisplayedBefore() + 1
		for (let i = firstSecondShown; i < lastSecondShown; i++) {
			if (!measureLines[i]) {
				continue
			}
			measureLines[i].forEach(tempoLine => {
				let ht = this.renderDimensions.getYForTime(tempoLine - time * 1000)

				ctx.moveTo(0, ht)
				ctx.lineTo(this.renderDimensions.windowWidth, ht)
			})
		}
		ctx.closePath()
		ctx.stroke()
	}
}
