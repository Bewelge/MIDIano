export class ParticleRender {
	constructor(ctx) {
		this.ctx = ctx
		this.particles = new Map()
	}
	createParticles(x, y, w, h, color) {
		for (let i = 0; i < Math.random() * 40; i++) {
			let rndX = x + w * 0.5 + w * 0.5 * (Math.random() - Math.random()) // / 2 - (w / 2) * (Math.random() - Math.random())

			let ang = (Math.random() - Math.random()) * 0.5 * Math.PI + Math.PI * 1.5
			let radius = Math.random() * 2 + 0.5
			rndX -= radius / 2
			let motion = Math.random() * 7 + 0.5
			let angMotion = Math.random() * 0.05
			let lifeTime = Math.random() * 3 + 5
			this.createParticle(
				rndX,
				y,
				ang,
				radius,
				motion,
				angMotion,
				color,
				lifeTime
			)
		}
	}
	createParticle(x, y, ang, radius, motion, angMotion, color, lifeTime) {
		if (!this.particles.has(color)) {
			this.particles.set(color, [])
		}
		this.particles
			.get(color)
			.push([x, y, ang, radius, motion, angMotion, lifeTime])
	}
	updateParticles() {
		this.particles.forEach(particleArray =>
			particleArray.forEach(particle => this.updateParticle(particle))
		)
		this.particles.forEach((particleArray, color) => {
			for (let i = particleArray.length - 1; i >= 0; i--) {
				if (particleArray[i][6] < 0) {
					particleArray.splice(i, 1)
				}
			}

			if (particleArray.length == 0) {
				this.particles.delete(color)
			}
		})
	}
	updateParticle(particle) {
		particle[0] += Math.cos(particle[2]) * particle[4] //x
		particle[1] += Math.sin(particle[2]) * particle[4] //y

		//turn ang
		particle[2] += particle[5]

		//dampen angular and xy-motion
		particle[4] *= 0.92
		particle[5] *= 0.92

		particle[3] = Math.max(0.5, particle[3] * 0.95)

		//particle lifetime
		particle[6]--
	}
	render() {
		this.updateParticles()
		this.strokeStyle = "rgba(255,255,255,0.2)"
		this.ctx.globalAlpha = 0.5

		this.particles.forEach((particleArray, color) => {
			this.ctx.fillStyle = color
			let c = this.ctx
			c.beginPath()
			particleArray.forEach(particle => this.renderParticle(particle))
			c.fill()
			c.closePath()
		})
		this.ctx.globalAlpha = 0.5
	}
	renderParticle(particle) {
		this.ctx.moveTo(particle[0], particle[1])
		this.ctx.arc(particle[0], particle[1], particle[3], 0, Math.PI * 2, 0)
	}
}
