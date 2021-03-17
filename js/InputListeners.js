import { getPlayer } from "./player/Player.js"
import { getSetting } from "./settings/Settings.js"

export class InputListeners {
	constructor(ui, render) {
		this.grabSpeed = []
		this.delay = false

		this.addMouseAndTouchListeners(render, ui)

		document.body.addEventListener("wheel", this.onWheel())

		this.addProgressBarMouseListeners(render)

		window.addEventListener("keydown", this.onKeyDown(ui))

		ui.setOnMenuHeightChange(val => render.onMenuHeightChanged(val))

		ui.fireInitialListeners()

		let player = getPlayer()
		render.setPianoInputListeners(
			player.addInputNoteOn.bind(player),
			player.addInputNoteOff.bind(player)
		)
	}

	addMouseAndTouchListeners(render, ui) {
		window.addEventListener("mouseup", ev => this.onMouseUp(ev, render))
		document.body.addEventListener(
			"mousedown",
			ev => this.onMouseDown(ev, render),
			{ passive: false }
		)
		document.body.addEventListener(
			"mousemove",
			ev => this.onMouseMove(ev, render, ui),
			{ passive: false }
		)
		window.addEventListener("touchend", ev => this.onMouseUp(ev, render), {
			passive: false
		})
		document.body.addEventListener(
			"touchstart",
			ev => this.onMouseDown(ev, render),
			{ passive: false }
		)
		document.body.addEventListener(
			"touchmove",
			ev => this.onMouseMove(ev, render, ui),
			{ passive: false }
		)
	}

	addProgressBarMouseListeners(render) {
		render
			.getProgressBarCanvas()
			.addEventListener("mousemove", this.onMouseMoveProgressCanvas(render))
		render
			.getProgressBarCanvas()
			.addEventListener("mousedown", this.onMouseDownProgressCanvas(render))
	}

	onWheel() {
		return event => {
			if (event.target != document.body) {
				return
			}
			if (this.delay) {
				return
			}
			this.delay = true

			let alreadyScrolling = getPlayer().scrolling != 0

			//Because Firefox does not set .wheelDelta
			let wheelDelta = event.wheelDelta ? event.wheelDelta : -1 * event.deltaY

			let evDel =
				((wheelDelta + 1) / (Math.abs(wheelDelta) + 1)) *
				Math.min(500, Math.abs(wheelDelta))

			var wheel = (evDel / Math.abs(evDel)) * 500

			getPlayer().scrolling -= 0.001 * wheel
			if (!alreadyScrolling) {
				getPlayer().handleScroll()
			}
			this.delay = false
		}
	}

	onKeyDown(ui) {
		return e => {
			if (!getPlayer().isFreeplay) {
				if (e.code == "Space") {
					e.preventDefault()
					if (!getPlayer().paused) {
						ui.clickPause(e)
					} else {
						ui.clickPlay(e)
					}
				} else if (e.code == "ArrowUp") {
					getPlayer().increaseSpeed(0.05)
					ui.getSpeedDisplayField().value =
						Math.floor(getPlayer().playbackSpeed * 100) + "%"
				} else if (e.code == "ArrowDown") {
					getPlayer().increaseSpeed(-0.05)
					ui.getSpeedDisplayField().value =
						Math.floor(getPlayer().playbackSpeed * 100) + "%"
				} else if (e.code == "ArrowLeft") {
					getPlayer().setTime(getPlayer().getTime() - 5)
				} else if (e.code == "ArrowRight") {
					getPlayer().setTime(getPlayer().getTime() + 5)
				}
			}
		}
	}

	onMouseDownProgressCanvas(render) {
		return ev => {
			ev.preventDefault()
			if (ev.target == render.getProgressBarCanvas()) {
				this.grabbedProgressBar = true
				getPlayer().wasPaused = getPlayer().paused
				getPlayer().pause()
				let newTime =
					(ev.clientX / render.renderDimensions.windowWidth) *
					(getPlayer().song.getEnd() / 1000)

				getPlayer().setTime(newTime)
			}
		}
	}

	onMouseMoveProgressCanvas(render) {
		return ev => {
			if (this.grabbedProgressBar && getPlayer().song) {
				let newTime =
					(ev.clientX / render.renderDimensions.windowWidth) *
					(getPlayer().song.getEnd() / 1000)
				getPlayer().setTime(newTime)
			}
		}
	}

	onMouseMove(ev, render, ui) {
		let pos = this.getXYFromMouseEvent(ev)
		if (this.grabbedProgressBar && getPlayer().song) {
			let newTime =
				(ev.clientX / render.renderDimensions.windowWidth) *
				(getPlayer().song.getEnd() / 1000)
			getPlayer().setTime(newTime)
			return
		}

		if (this.grabbedMainCanvas && getPlayer().song) {
			if (this.lastYGrabbed) {
				let alreadyScrolling = getPlayer().scrolling != 0
				let yChange =
					(getSetting("reverseNoteDirection") ? -1 : 1) *
					(this.lastYGrabbed - pos.y)
				if (!alreadyScrolling) {
					getPlayer().setTime(
						getPlayer().getTime() - render.getTimeFromHeight(yChange)
					)
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

	onMouseDown(ev, render) {
		let pos = this.getXYFromMouseEvent(ev)
		if (
			ev.target == document.body &&
			render.isOnMainCanvas(pos) &&
			!this.grabbedProgressBar
		) {
			getPlayer().wasPaused = getPlayer().paused
			ev.preventDefault()
			this.grabbedMainCanvas = true
			getPlayer().pause()
		}
	}

	onMouseUp(ev, render) {
		let pos = this.getXYFromMouseEvent(ev)
		if (ev.target == document.body && render.isOnMainCanvas(pos)) {
			ev.preventDefault()
		}
		if (this.grabSpeed.length) {
			getPlayer().scrolling = this.grabSpeed[this.grabSpeed.length - 1] / 50
			getPlayer().handleScroll()
			this.grabSpeed = []
		}
		if (this.grabbedProgressBar || this.grabbedMainCanvas) {
			if (!getPlayer().wasPaused) {
				getPlayer().resume()
			}
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
