import { getSetting } from "../settings/Settings.js"

/**
 * Particles handler
 */
export class NoteParticleRender {
	constructor(ctx, renderDimensions) {
		this.ctx = ctx
		this.renderDimensions = renderDimensions
		this.particles = new Map()
	}
	createParticles(x, y, w, h, color, velocity) {
		let amnt = getSetting("particleAmount")
		if (getSetting("showParticlesTop")) {
			for (let i = 0; i < Math.random() * 0.5 * amnt + 0.5 * amnt; i++) {
				let rndX = x + 3 + w * 0.5 + w * 0.5 * (-1 + 2 * Math.random())
				let motX =
					(Math.random() - Math.random()) * 0.5 * getSetting("particleSpeed")
				let motY =
					(-Math.random() * getSetting("particleSpeed") * velocity) / 127
				let radius =
					(0.5 + 0.5 * Math.random()) * getSetting("particleSize") + 0.5
				rndX -= radius / 2
				let lifeTime = Math.random() * getSetting("particleLife") + 2
				this.createParticle(rndX, y, motX, motY, radius, color, lifeTime)
			}
		}
		if (getSetting("showParticlesBottom")) {
			for (let i = 0; i < Math.random() * 0.5 * amnt + 0.5 * amnt; i++) {
				let rndX = x + 3 + w * 0.5 + w * 0.5 * (-1 + 2 * Math.random())
				let motX =
					(Math.random() - Math.random()) * 0.5 * getSetting("particleSpeed")
				let motY =
					(-Math.random() * getSetting("particleSpeed") * velocity) / 127
				let radius =
					(0.5 + 0.5 * Math.random()) * getSetting("particleSize") + 0.5
				rndX -= radius / 2
				let lifeTime = Math.random() * getSetting("particleLife") + 2
				this.createParticle(
					rndX,
					y + h,
					motX,
					-1 * motY * 0.5,
					radius,
					color,
					lifeTime
				)
			}
		}
	}
	createParticle(x, y, motX, motY, radius, color, lifeTime) {
		if (!this.particles.has(color)) {
			this.particles.set(color, [])
		}
		this.particles.get(color).push([x, y, motX, motY, radius, lifeTime, 0])
	}
	updateParticles() {
		this.particles.forEach(particleArray =>
			particleArray.forEach(particle => this.updateParticle(particle))
		)
		this.clearDeadParticles()
	}
	clearDeadParticles() {
		this.particles.forEach((particleArray, color) => {
			for (let i = particleArray.length - 1; i >= 0; i--) {
				if (particleArray[i][6] >= particleArray[i][5]) {
					particleArray.splice(i, 1)
				}
			}
			if (particleArray.length == 0) {
				this.particles.delete(color)
			}
		})
	}

	updateParticle(particle) {
		particle[0] += particle[2]
		particle[1] += particle[3]

		// particle[3] *= 1 + (particle[6] / particle[5]) * 0.05
		particle[3] += (particle[6] / particle[5]) * 0.3

		//dampen xy-motion
		particle[2] *= 0.95
		// particle[3] *= 0.92

		//particle lifetime ticker
		particle[6] += particle[4] * 0.1
	}
	render() {
		let stroke = getSetting("particleStroke")
		this.ctx.globalAlpha = 0.5
		if (stroke) {
			this.ctx.strokeStyle = "rgba(255,255,255,0.8)"
			this.ctx.lineWidth = 0.5
		}
		this.particles.forEach((particleArray, color) => {
			let c = this.ctx
			c.fillStyle = color
			c.beginPath()
			particleArray.forEach(particle => this.renderParticle(particle))
			c.fill()
			if (stroke) {
				c.stroke()
			}
			c.closePath()
		})
		this.updateParticles()
		this.ctx.globalAlpha = 1
	}
	renderParticle(particle) {
		this.ctx.moveTo(particle[0], particle[1])
		let rad = Math.max(0.1, (1 - particle[6] / particle[5]) * particle[4])
		this.ctx.arc(particle[0], particle[1], rad, 0, Math.PI * 2, 0)
	}
}
