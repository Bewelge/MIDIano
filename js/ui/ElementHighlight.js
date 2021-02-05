export class ElementHighlight {
	constructor(element, time) {
		time = time || 1500

		element.classList.add("highlighted")
		window.setTimeout(() => {
			element.classList.remove("highlighted")
		}, time)
	}
}
