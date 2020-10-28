import { sum } from "./Util.js"
export class InputListeners {
	constructor(player, ui, render) {
		this.grabSpeed = []
		this.delay = false
		window.addEventListener("mouseup", ev => this.onMouseUp(player))
		document.body.addEventListener("mousedown", ev =>
			this.onMouseDown(ev, render)
		)
		document.body.addEventListener("mousemove", ev =>
			this.onMouseMove(ev, player, render, ui)
		)
		document.body.addEventListener("wheel", this.onWheel(player))

		this.addProgressBarMouseListeners(render, player)

		window.addEventListener("keydown", this.onKeyDown(player, ui))

		ui.setOnMenuHeightChange(val => render.onMenuHeightChanged(val))

		ui.fireInitialListeners()
	}

	addProgressBarMouseListeners(render, player) {
		render
			.getProgressBarCanvas()
			.addEventListener(
				"mousemove",
				this.onMouseMoveProgressCanvas(render, player)
			)
		render
			.getProgressBarCanvas()
			.addEventListener(
				"mousedown",
				this.onMouseDownProgressCanvas(render, player)
			)
	}

	onWheel(player) {
		return event => {
			if (this.delay) {
				return
			}
			this.delay = true

			let alreadyScrolling = player.scrolling != 0

			let evDel =
				((event.wheelDelta + 1) / (Math.abs(event.wheelDelta) + 1)) *
				Math.min(500, Math.abs(event.wheelDelta))
			var wheel = (evDel / Math.abs(evDel)) * 500

			player.scrolling -= 0.001 * wheel
			if (!alreadyScrolling) {
				player.handleScroll()
			}
			this.delay = false
		}
	}

	onKeyDown(player, ui) {
		return e => {
			if (e.code == "Space") {
				e.preventDefault()
				if (!player.paused) {
					ui.clickPause(e)
				} else {
					ui.clickPlay(e)
				}
			} else if (e.code == "ArrowUp") {
				player.playbackSpeed += 0.05
				ui.getSpeedDisplayField().value =
					Math.floor(player.playbackSpeed * 100) + "%"
			} else if (e.code == "ArrowDown") {
				player.playbackSpeed -= 0.05
				ui.getSpeedDisplayField().value =
					Math.floor(player.playbackSpeed * 100) + "%"
			} else if (e.code == "ArrowLeft") {
				player.setTime(player.getTime() - 5)
			} else if (e.code == "ArrowRight") {
				player.setTime(player.getTime() + 5)
			}
		}
	}

	onMouseDownProgressCanvas(render, player) {
		return ev => {
			if (ev.target == render.getProgressBarCanvas()) {
				this.grabbedProgressBar = true
				let newTime =
					(ev.clientX / render.windowWidth) * (player.song.getEnd() / 1000)

				player.setTime(newTime)
			}
		}
	}

	onMouseMoveProgressCanvas(render, player) {
		return ev => {
			if (this.grabbedProgressBar && player.song) {
				let newTime =
					(ev.clientX / render.windowWidth) * (player.song.getEnd() / 1000)

				player.setTime(newTime)
			}
		}
	}

	onMouseMove(ev, player, render, ui) {
		if (this.grabbedMainCanvas && player.song) {
			if (this.lastYGrabbed) {
				let alreadyScrolling = player.scrolling != 0
				let yChange = this.lastYGrabbed - ev.clientY
				if (!alreadyScrolling) {
					player.setTime(player.getTime() - render.getTimeFromHeight(yChange))
					this.grabSpeed.push(yChange)
					if (this.grabSpeed.length > 3) {
						this.grabSpeed.splice(0, 1)
					}
				}
			}
			this.lastYGrabbed = ev.clientY
		}

		render.setMouseCoords(ev.clientX, ev.clientY)

		ui.mouseMoved()
	}

	onMouseDown(ev, render) {
		if (ev.target == document.body && render.isOnMainCanvas(ev)) {
			this.grabbedMainCanvas = true
		}
	}

	onMouseUp(player) {
		if (this.grabSpeed.length) {
			player.scrolling = sum(this.grabSpeed) / 50
			player.handleScroll()
			this.grabSpeed = []
		}
		this.grabbedProgressBar = false
		this.grabbedMainCanvas = false
		this.lastYGrabbed = false
	}
}
