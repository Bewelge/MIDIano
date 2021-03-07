import { getSetting } from "../settings/Settings.js"

const PARTICLE_LIFE_TIME = 10
/**
 * Particles handler
 */
export class PianoParticleRender {
	constructor(ctxForeground, renderDimensions) {
		this.ctxForeground = ctxForeground
		this.renderDimensions = renderDimensions
		this.particles = new Map()
	}
	add(noteRenderinfo) {
		let keyDims = this.renderDimensions.getKeyDimensions(
			noteRenderinfo.noteNumber
		)
		let y =
			keyDims.y +
			keyDims.h -
			5 +
			this.renderDimensions.getAbsolutePianoPosition()
		let color = noteRenderinfo.fillStyle

		if (!this.particles.has(color)) {
			this.particles.set(color, [])
		}
		this.particles
			.get(color)
			.push([keyDims.x, y, keyDims.w, 5, PARTICLE_LIFE_TIME])
		return
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
				if (particleArray[i][4] < 0) {
					particleArray.splice(i, 1)
				}
			}
			if (particleArray.length == 0) {
				this.particles.delete(color)
			}
		})
	}

	updateParticle(particle) {
		particle[4]--
		particle[0] -= 2
		particle[2] += 4

		// particle[1] += 2
		particle[3] += 6
	}
	render() {
		this.updateParticles()
		this.particles.forEach((particleArray, color) => {
			let c = this.ctxForeground
			c.globalAlpha = 0.4
			c.fillStyle = color
			c.lineWidth = 2
			c.beginPath()
			particleArray.forEach(particle => this.renderParticle(particle, c))
			c.fill()
			c.closePath()
			c.globalAlpha = 1
		})
	}
	renderParticle(particle, ctx) {
		ctx.rect(particle[0], particle[1], particle[2], particle[3])
	}
}
