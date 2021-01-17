export class SustainRender {
	constructor(ctx, lookBackTime, lookAheadTime, yToTimeFunc) {
		this.ctx = ctx
		this.overlays = []
		this.lookBackTime = lookBackTime
		this.lookAheadTime = lookAheadTime
		this.yToTimeFunc = yToTimeFunc

		this.sustainPeriodFillStyle = "rgba(0,0,0,0.4)"
		this.sustainOnStrokeStyle = "rgba(55,155,55,0.6)"
		this.sustainOffStrokeStyle = "rgba(155,55,55,0.6)"
		this.sustainOnOffFont = "12px Arial black"
	}
	resize(windowWidth, windowHeight) {
		this.windowWidth = windowWidth
		this.windowHeight = windowHeight
	}
	render(playerState, settings) {
		this.settings = settings
		let sustainsBySecond = playerState.song.sustainsBySecond
		let time = playerState.time

		if (this.settings.showSustainOnOffs) {
			this.renderSustainOnOffs(time, sustainsBySecond)
		}
		if (this.settings.showSustainPeriods) {
			this.renderSustainPeriods(time, playerState.song.sustainPeriods)
		}
	}
	renderSustainOnOffs(time, sustainsBySecond) {
		let lookBackTime = Math.floor(time - this.lookBackTime)
		let lookAheadTime = Math.ceil(time + this.lookAheadTime)

		// Draw sustain On and Offs
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
					let y = this.yToTimeFunc(sustain.timestamp - time * 1000)
					this.ctx.beginPath()
					this.ctx.moveTo(0, y)
					this.ctx.lineTo(this.windowWidth, y)
					this.ctx.closePath()
					this.ctx.stroke()

					this.ctx.font = this.sustainOnOffFont
					this.ctx.fillText(text, 10, y - 2)
				})
			}
		}
	}
	renderSustainPeriods(time, sustainPeriods) {
		let lookBackTime = Math.floor(time - this.lookBackTime)
		let lookAheadTime = Math.ceil(time + this.lookAheadTime)
		// Draw sustain Periods
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
				let yStart = this.yToTimeFunc(period.start - time * 1000)
				let yEnd = this.yToTimeFunc(period.end - time * 1000)

				this.ctx.fillRect(0, yEnd, this.windowWidth, yStart - yEnd)
			})
	}
}
