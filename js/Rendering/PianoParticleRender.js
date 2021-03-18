import { getSetting } from "../settings/Settings.js"

const PARTICLE_LIFE_TIME = 22

export class PianoParticleRender {
	constructor(ctxWhite, ctxBlack, renderDimensions) {
		this.ctxWhite = ctxWhite
		this.ctxBlack = ctxBlack
		this.renderDimensions = renderDimensions
		this.particles = {
			white: new Map(),
			black: new Map()
		}
	}
	add(noteRenderinfo, isWhite) {
		let keyDims = this.renderDimensions.getKeyDimensions(
			noteRenderinfo.noteNumber
		)

		let color = noteRenderinfo.fillStyle

		let keyColor = noteRenderinfo.isBlack ? "black" : "white"

		if (!this.particles[keyColor].has(color)) {
			this.particles[keyColor].set(color, [])
		}
		this.particles[keyColor]
			.get(color)
			.push([
				keyDims.x,
				0,
				keyDims.w,
				keyDims.h,
				(PARTICLE_LIFE_TIME * noteRenderinfo.velocity) / 127
			])
		return
	}

	updateParticles() {
		this.particles.white.forEach(particleArray =>
			particleArray.forEach(particle => this.updateParticle(particle))
		)
		this.particles.black.forEach(particleArray =>
			particleArray.forEach(particle => this.updateParticle(particle))
		)
		this.clearDeadParticles()
	}
	clearDeadParticles() {
		this.particles.white.forEach((particleArray, color) => {
			for (let i = particleArray.length - 1; i >= 0; i--) {
				if (particleArray[i][4] < 0) {
					particleArray.splice(i, 1)
				}
			}
			if (particleArray.length == 0) {
				this.particles.white.delete(color)
			}
		})
		this.particles.black.forEach((particleArray, color) => {
			for (let i = particleArray.length - 1; i >= 0; i--) {
				if (particleArray[i][4] < 0) {
					particleArray.splice(i, 1)
				}
			}
			if (particleArray.length == 0) {
				this.particles.black.delete(color)
			}
		})
	}

	updateParticle(particle) {
		particle[4]--
	}
	render() {
		this.particles.white.forEach((particleArray, color) => {
			let c = this.ctxWhite
			c.strokeStyle = "rgba(255,255,255,0.4)"
			c.lineWidth = 2
			c.beginPath()
			particleArray.forEach(particle => this.renderParticle(particle, c))
			c.stroke()
			c.closePath()
		})
		this.particles.black.forEach((particleArray, color) => {
			let c = this.ctxBlack
			c.strokeStyle = "rgba(255,255,255,0.4)"
			c.lineWidth = 2
			c.beginPath()
			particleArray.forEach(particle => this.renderParticle(particle, c))
			c.stroke()
			c.closePath()
		})
		this.updateParticles()
	}
	renderParticle(particle, ctx) {
		let doneRat = 1 - particle[4] / PARTICLE_LIFE_TIME
		let wdRatio = (doneRat - 0.1) * particle[2] * 0.3
		ctx.moveTo(particle[0] - wdRatio / 2, 5)
		ctx.lineTo(particle[0] - wdRatio / 2, particle[3])

		ctx.moveTo(particle[0] - wdRatio / 2 + particle[2] + wdRatio, 5)
		ctx.lineTo(particle[0] - wdRatio / 2 + particle[2] + wdRatio, particle[3])

		// ctx.rect(
		// 	particle[0] + doneRat / 2,
		// 	particle[1],
		// 	particle[2] - doneRat,
		// 	particle[3]
		// )
	}
}
