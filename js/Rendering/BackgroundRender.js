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
	render() {
		let c = this.ctx
		c.clearRect(
			0,
			0,
			this.renderDimensions.windowWidth,
			this.renderDimensions.windowHeight
		)
		const col1 = "rgba(200,200,200,1)"
		const col3 = "rgba(160,160,160,0.8)"
		const col2 = "rgba(140,140,140,0.8)"
		c.strokeStyle = col1
		c.fillStyle = col2
		let whiteKey = 0
		for (let i = 0; i < 88; i++) {
			if (!isBlack(i)) {
				c.strokeStyle = i % 2 ? col3 : col3
				c.fillStyle = (i + 2) % 2 ? col3 : col2
				c.lineWidth = 1
				//c.globalAlpha = 0.25  + (i+9)%3 / 4  + (i + 9) % 12 / 48
				let dim = this.renderDimensions.getKeyDimensions(i)
				c.fillRect(dim.x, dim.y, dim.w, this.renderDimensions.windowHeight)
				c.strokeRect(dim.x, dim.y, dim.w, this.renderDimensions.windowHeight)

				if (1 + (whiteKey % 7) == 3) {
					c.lineWidth = 5
					c.beginPath()
					c.moveTo(dim.x, 0)
					c.lineTo(dim.x, this.renderDimensions.windowHeight)
					c.stroke()
					c.closePath()
				}
				whiteKey++
			}
		}
	}
}
