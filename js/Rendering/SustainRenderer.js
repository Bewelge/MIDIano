import { getSetting } from "../settings/Settings.js"

/**
 * Class to render the sustain events in the midi-song. Can fill the sustain periods or draw lines for the individual control-events.
 */
export class SustainRender {
	constructor(ctx, renderDimensions, lookBackTime, lookAheadTime) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
		this.lookBackTime = lookBackTime
		this.lookAheadTime = lookAheadTime

		this.sustainPeriodFillStyle = "rgba(0,0,0,0.4)"
		this.sustainOnStrokeStyle = "rgba(55,155,55,0.6)"
		this.sustainOffStrokeStyle = "rgba(155,55,55,0.6)"
		this.sustainOnOffFont = "12px Arial black"
	}
	render(playerState) {
		let sustainsBySecond = playerState.song.sustainsBySecond
		let time = playerState.time

		if (getSetting("showSustainOnOffs")) {
			this.renderSustainOnOffs(time, sustainsBySecond)
		}
		if (getSetting("showSustainPeriods")) {
			this.renderSustainPeriods(time, playerState.song.sustainPeriods)
		}
	}
	/**
	 * Renders On/Off Sustain Control-Events as lines on screen.
	 *
	 * @param {Number} time
	 * @param {Object} sustainsBySecond
	 */
	renderSustainOnOffs(time, sustainsBySecond) {
		let lookBackTime = Math.floor(time - this.lookBackTime)
		let lookAheadTime = Math.ceil(time + this.lookAheadTime)

		for (
			let lookUpTime = lookBackTime;
			lookUpTime < lookAheadTime;
			lookUpTime++
		) {
			if (sustainsBySecond.hasOwnProperty(lookUpTime)) {
				sustainsBySecond[lookUpTime].forEach(sustain => {
					this.ctx.lineWidth = "1"
					let text = ""
					this.ctx.fillStyle = "rgba(0,0,0,0.8)"
					if (sustain.isOn) {
						this.ctx.strokeStyle = this.sustainOnStrokeStyle
						text = "Sustain On"
					} else {
						this.ctx.strokeStyle = this.sustainOffStrokeStyle
						text = "Sustain Off"
					}
					let y = this.renderDimensions.getYForTime(
						sustain.timestamp - time * 1000
					)
					this.ctx.beginPath()
					this.ctx.moveTo(0, y)
					this.ctx.lineTo(this.renderDimensions.windowWidth, y)
					this.ctx.closePath()
					this.ctx.stroke()

					this.ctx.font = this.sustainOnOffFont
					this.ctx.fillText(text, 10, y - 2)
				})
			}
		}
	}
	/**
	 * Renders Sustain Periods as rectangles on screen.
	 * @param {Number} time
	 * @param {Array} sustainPeriods
	 */
	renderSustainPeriods(time, sustainPeriods) {
		let lookBackTime = Math.floor(time - this.lookBackTime)
		let lookAheadTime = Math.ceil(time + this.lookAheadTime)
		this.ctx.fillStyle = this.sustainPeriodFillStyle

		sustainPeriods
			.filter(
				period =>
					(period.start < lookAheadTime * 1000 &&
						period.start > lookBackTime * 1000) ||
					(period.start < lookBackTime * 1000 &&
						period.end > lookBackTime * 1000)
			)
			.forEach(period => {
				let yStart = this.renderDimensions.getYForTime(
					period.start - time * 1000
				)
				let yEnd = this.renderDimensions.getYForTime(period.end - time * 1000)

				this.ctx.fillRect(
					0,
					yEnd,
					this.renderDimensions.windowWidth,
					yStart - yEnd
				)
			})
	}
}
