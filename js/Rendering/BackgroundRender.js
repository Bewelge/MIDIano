import { getSetting } from "../settings/Settings.js"
import { isBlack } from "../Util.js"
/**
 * Class that renders the background of the main canvas
 */
export class BackgroundRender {
	constructor(ctx, renderDimensions) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
		this.renderDimensions.registerResizeCallback(this.render.bind(this))
		this.render()
	}
	renderIfColorsChanged() {
		if (
			this.col1 != getSetting("bgCol1") ||
			this.col2 != getSetting("bgCol2") ||
			this.col3 != getSetting("bgCol3") ||
			this.pianoPosition != getSetting("pianoPosition")
		) {
			this.render()
		}
	}
	render() {
		let c = this.ctx
		c.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			this.renderDimensions.windowHeight
		)

		let reversed = getSetting("reverseNoteDirection")
		let bgHeight = reversed
			? this.renderDimensions.windowHeight -
			  this.renderDimensions.getAbsolutePianoPosition()
			: this.renderDimensions.getAbsolutePianoPosition()
		let bgY = reversed ? this.renderDimensions.getAbsolutePianoPosition() : 0
		const col1 = getSetting("bgCol1")
		const col2 = getSetting("bgCol2")
		const col3 = getSetting("bgCol3")
		c.strokeStyle = col1
		c.fillStyle = col2
		let whiteKey = 0
		for (let i = 0; i < 88; i++) {
			if (!isBlack(i)) {
				c.strokeStyle = col3
				c.fillStyle = (i + 2) % 2 ? col1 : col2
				c.lineWidth = 1

				let dim = this.renderDimensions.getKeyDimensions(i)
				c.fillRect(dim.x, bgY, dim.w, bgHeight)

				if (1 + (whiteKey % 7) == 3) {
					c.lineWidth = 2
					c.beginPath()
					c.moveTo(dim.x, bgY)
					c.lineTo(dim.x, bgY + bgHeight)
					c.stroke()
					c.closePath()
				}
				whiteKey++
			}
		}
		this.col1 = col1
		this.col2 = col2
		this.col3 = col3
		this.pianoPosition = getSetting("pianoPosition")
	}
}
