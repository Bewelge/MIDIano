import { DomHelper } from "./DomHelper.js"
class Loader {
	startLoad() {
		this.getLoadingDiv().style.display = "block"
		this.getLoadingText().innerHTML = "Loading"
		this.loading = true
		this.loadAnimation()
	}
	stopLoad() {
		this.getLoadingDiv().style.display = "none"
		this.loading = false
	}
	loadAnimation() {
		let currentText = this.getLoadingText().innerHTML
		currentText = currentText.replace("...", " ..")
		currentText = currentText.replace(" ..", ". .")
		currentText = currentText.replace(". .", ".. ")
		currentText = currentText.replace(".. ", "...")
		this.getLoadingText().innerHTML = currentText
		if (this.loading) {
			window.requestAnimationFrame(this.loadAnimation.bind(this))
		}
	}
	setLoadMessage(msg) {
		this.getLoadingText().innerHTML = msg + "..."
	}
	getLoadingText() {
		if (!this.loadingText) {
			this.loadingText = DomHelper.createElement("p")
			this.getLoadingDiv().appendChild(this.loadingText)
		}
		return this.loadingText
	}
	getLoadingDiv() {
		if (!this.loadingDiv) {
			this.loadingDiv = DomHelper.createDivWithIdAndClass(
				"loadingDiv",
				"fullscreen"
			)

			let spinner = DomHelper.createSpinner()
			this.loadingDiv.appendChild(spinner)
			document.body.appendChild(this.loadingDiv)
		}
		return this.loadingDiv
	}
}

export const getLoader = () => loaderSingleton
const loaderSingleton = new Loader()
