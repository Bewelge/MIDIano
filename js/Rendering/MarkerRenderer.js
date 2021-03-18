import { getSetting } from "../settings/Settings.js"

/**
 * Class to render the markers in the midi-song
 */
export class MarkerRenderer {
	constructor(ctx, renderDimensions) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
	}
	render(time, markers) {
		if (getSetting("showMarkersSong")) {
			let lookAheadTime = Math.ceil(
				time + this.renderDimensions.getSecondsDisplayedBefore() + 1
			)

			let c = this.ctx
			c.fillStyle = "rgba(255,255,255,0.8)"
			c.strokeStyle = "rgba(255,255,255,0.8)"
			c.font = "25px Arial black"
			c.textBaseline = "top"
			c.lineWidth = 1.5
			markers.forEach(marker => {
				if (
					marker.timestamp / 1000 >= time &&
					marker.timestamp / 1000 < lookAheadTime
				) {
					let y = this.renderDimensions.getYForTime(
						marker.timestamp - time * 1000
					)
					let txtWd = c.measureText(marker.text).width
					c.fillText(
						marker.text,
						this.renderDimensions.windowWidth / 2 - txtWd / 2,
						y + 3
					)
					c.beginPath()
					c.moveTo(0, y)
					c.lineTo(this.renderDimensions.windowWidth, y)
					c.closePath()
					c.stroke()
				}
			})
		}
	}
}
