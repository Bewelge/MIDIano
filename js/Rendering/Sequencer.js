class Sequencer {
	constructor() {
		this.noteSequence = []
	}
	update() {
		if (this.scrolling != 0) {
			window.setTimeout(this.play.bind(this), 20)
			return
		}

		let delta = (this.context.currentTime - this.lastTime) * this.playbackSpeed
		this.progress += delta
		this.lastTime = this.context.currentTime

		let currentTime = this.getTime()

		if (this.isSongEnded(currentTime)) {
			this.pause()
			return
		}

		while (this.isNextNoteReached(currentTime)) {
			this.playNote(this.noteSequence.shift())
		}

		this.setChannelVolumes(currentTime)

		if (!this.paused) {
			window.requestAnimationFrame(this.play.bind(this))
		}
	}
}
