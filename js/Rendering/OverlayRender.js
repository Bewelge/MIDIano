export class OverlayRender {
	constructor(ctx) {
		this.ctx = ctx
		this.overlays = []
	}
	resize(windowWidth, windowHeight) {
		this.windowWidth = windowWidth
		this.windowHeight = windowHeight
	}
	addOverlay(message, duration) {
		let totalDuration = duration
		this.overlays.push({ message, totalDuration, duration })
	}
	render() {
		if (this.overlays.length) {
			if (--this.overlays[0].duration < 0) {
				this.overlays.splice(0, 1)
				return
			}

			let currentOverlay = this.overlays[0]

			let messageLines = currentOverlay.message.split("\n")
			this.ctx.globalAlpha =
				currentOverlay.duration / currentOverlay.totalDuration
			this.ctx.font = "32px 'Source Sans Pro', sans-serif"
			this.ctx.fillStyle = "rgba(255,255,255,1)"
			messageLines.forEach((line, index) => {
				let wd = this.ctx.measureText(line).width
				this.ctx.fillText(
					line,
					this.windowWidth / 2 - wd / 2,
					this.windowHeight / 2 + index * 40
				)
			})
		}
	}
}
