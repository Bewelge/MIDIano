import { sum } from "./Util.js"
export class InputListeners {
	constructor(player, ui, render) {
		this.grabSpeed = []
		this.delay = false

		this.addMouseAndTouchListeners(render, player, ui)

		document.body.addEventListener("wheel", this.onWheel(player))

		this.addProgressBarMouseListeners(render, player)

		window.addEventListener("keydown", this.onKeyDown(player, ui))

		ui.setOnMenuHeightChange(val => render.onMenuHeightChanged(val))

		ui.fireInitialListeners()
	}

	addMouseAndTouchListeners(render, player, ui) {
		window.addEventListener("mouseup", ev => this.onMouseUp(ev, render, player))
		document.body.addEventListener(
			"mousedown",
			ev => this.onMouseDown(ev, render, player),
			{ passive: false }
		)
		document.body.addEventListener(
			"mousemove",
			ev => this.onMouseMove(ev, player, render, ui),
			{ passive: false }
		)
		window.addEventListener(
			"touchend",
			ev => this.onMouseUp(ev, render, player),
			{
				passive: false
			}
		)
		document.body.addEventListener(
			"touchstart",
			ev => this.onMouseDown(ev, render),
			{ passive: false }
		)
		document.body.addEventListener(
			"touchmove",
			ev => this.onMouseMove(ev, player, render, ui),
			{ passive: false }
		)
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
			if (event.target != document.body) {
				return
			}
			if (this.delay) {
				return
			}
			this.delay = true

			let alreadyScrolling = player.scrolling != 0

			//Because Firefox does not set .wheeldata
			let wheelDelta = event.wheelDelta ? event.wheelDelta : -1 * event.deltaY

			let evDel =
				((wheelDelta + 1) / (Math.abs(wheelDelta) + 1)) *
				Math.min(500, Math.abs(wheelDelta))

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
			ev.preventDefault()
			if (ev.target == render.getProgressBarCanvas()) {
				this.grabbedProgressBar = true
				player.wasPaused = player.paused
				player.paused = true
				let newTime =
					(ev.clientX / render.renderDimensions.windowWidth) *
					(player.song.getEnd() / 1000)

				player.setTime(newTime)
			}
		}
	}

	onMouseMoveProgressCanvas(render, player) {
		return ev => {
			if (this.grabbedProgressBar && player.song) {
				let newTime =
					(ev.clientX / render.renderDimensions.windowWidth) *
					(player.song.getEnd() / 1000)
				player.setTime(newTime)
			}
		}
	}

	onMouseMove(ev, player, render, ui) {
		let pos = this.getXYFromMouseEvent(ev)
		if (this.grabbedProgressBar && player.song) {
			let newTime =
				(ev.clientX / render.renderDimensions.windowWidth) *
				(player.song.getEnd() / 1000)
			player.setTime(newTime)
			return
		}

		if (this.grabbedMainCanvas && player.song) {
			if (this.lastYGrabbed) {
				let alreadyScrolling = player.scrolling != 0
				let yChange = this.lastYGrabbed - pos.y
				if (!alreadyScrolling) {
					player.setTime(player.getTime() - render.getTimeFromHeight(yChange))
					this.grabSpeed.push(yChange)
					if (this.grabSpeed.length > 3) {
						this.grabSpeed.splice(0, 1)
					}
				}
			}
			this.lastYGrabbed = pos.y
		}

		render.setMouseCoords(ev.clientX, ev.clientY)

		ui.mouseMoved()
	}

	onMouseDown(ev, render, player) {
		let pos = this.getXYFromMouseEvent(ev)
		if (
			ev.target == document.body &&
			render.isOnMainCanvas(pos) &&
			!this.grabbedProgressBar
		) {
			player.wasPaused = player.paused
			ev.preventDefault()
			this.grabbedMainCanvas = true
			player.paused = true
		}
	}

	onMouseUp(ev, render, player) {
		let pos = this.getXYFromMouseEvent(ev)
		if (ev.target == document.body && render.isOnMainCanvas(pos)) {
			ev.preventDefault()
		}
		if (this.grabSpeed.length) {
			player.scrolling = this.grabSpeed[this.grabSpeed.length - 1] / 50
			player.handleScroll()
			this.grabSpeed = []
		}
		if (this.grabbedProgressBar || this.grabbedMainCanvas) {
			player.paused = player.wasPaused
		}
		this.grabbedProgressBar = false
		this.grabbedMainCanvas = false
		this.lastYGrabbed = false
	}

	getXYFromMouseEvent(ev) {
		if (ev.clientX == undefined) {
			if (ev.touches.length) {
				return {
					x: ev.touches[ev.touches.length - 1].clientX,
					y: ev.touches[ev.touches.length - 1].clientY
				}
			} else {
				return { x: -1, y: -1 }
			}
		}
		return { x: ev.clientX, y: ev.clientY }
	}
}
