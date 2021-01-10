export class ParticleRender {
	constructor(ctx) {
		this.ctx = ctx
		this.particles = new Map()
	}
	createParticles(x, y, w, h, color) {
		for (let i = 0; i < Math.random() * this.settings.particleAmount; i++) {
			let rndX = x + w * 0.5 + w * 0.5 * (Math.random() - Math.random()) // / 2 - (w / 2) * (Math.random() - Math.random())

			let motX = (Math.random() - Math.random()) * this.settings.particleSpeed
			let motY = -Math.random() * this.settings.particleSpeed
			let radius = Math.random() * this.settings.particleSize + 0.5
			rndX -= radius / 2
			let lifeTime = Math.random() * this.settings.particleLife + 2
			this.createParticle(rndX, y, motX, motY, radius, color, lifeTime)
		}
	}
	createParticle(x, y, motX, motY, radius, color, lifeTime) {
		if (!this.particles.has(color)) {
			this.particles.set(color, [])
		}
		this.particles.get(color).push([x, y, motX, motY, radius, lifeTime])
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
				if (particleArray[i][5] < 0) {
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

		//dampen xy-motion
		particle[2] *= 0.92
		particle[3] *= 0.92

		//particle lifetime
		particle[5]--
	}
	render(settings) {
		this.settings = settings
		this.updateParticles()
		this.strokeStyle = "rgba(255,255,255,0.2)"
		this.ctx.globalAlpha = 0.5

		this.particles.forEach((particleArray, color) => {
			let c = this.ctx
			c.fillStyle = color
			c.beginPath()
			particleArray.forEach(particle => this.renderParticle(particle))
			c.fill()
			c.closePath()
		})
		this.ctx.globalAlpha = 0.5
	}
	renderParticle(particle) {
		this.ctx.moveTo(particle[0], particle[1])
		this.ctx.arc(particle[0], particle[1], particle[4], 0, Math.PI * 2, 0)
	}
}
