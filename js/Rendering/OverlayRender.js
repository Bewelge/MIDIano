/**
 * Class to display message-overlays on screen
 */
export class OverlayRender {
	constructor(ctx, renderDimensions) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
		this.overlays = []
	}
	/**
	 * add a overlay-message to the screen
	 *
	 * @param {String} message
	 * @param {Number} duration
	 */
	addOverlay(message, duration) {
		let totalDuration = duration
		this.overlays.push({ message, totalDuration, duration })
	}
	/**
	 * Render / Update the overlays.
	 */
	render() {
		for (let i = this.overlays.length - 1; i >= 0; i--) {
			let overlay = this.overlays[i]
			overlay.duration--
			if (overlay.duration < 0) {
				this.overlays.splice(i, 1)
			}
		}

		if (this.overlays.length) {
			this.globalAlpha = this.setAlphaForOverlay(
				this.overlays[this.overlays.length - 1]
			)
			this.ctx.fillStyle = "rgba(0,0,0,0.9)"
			this.ctx.fillRect(
				0,
				0,
				this.renderDimensions.windowWidth,
				this.renderDimensions.windowHeight
			)
		}
		for (let i = 0; i < this.overlays.length; i++) {
			let overlay = this.overlays[i]

			this.setAlphaForOverlay(overlay)

			this.ctx.font = "32px 'Source Sans Pro', sans-serif"
			this.ctx.fillStyle = "white"

			let wd = this.ctx.measureText(overlay.message).width
			this.ctx.fillText(
				overlay.message,
				this.renderDimensions.windowWidth / 2 - wd / 2,
				this.renderDimensions.windowHeight / 4 + i * 40
			)
		}
		this.ctx.globalAlpha = 1
	}

	setAlphaForOverlay(overlay) {
		let ratio = 1 - overlay.duration / overlay.totalDuration
		if (ratio < 0.1) {
			this.ctx.globalAlpha = ratio / 0.1
		} else {
			this.ctx.globalAlpha = (0.9 - (ratio - 0.1)) / 0.9
		}
		return ratio
	}
}
