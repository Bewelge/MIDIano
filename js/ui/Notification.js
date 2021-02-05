import { DomHelper } from "./DomHelper.js"

export class Notification {
	static create(message, time) {
		time = time || 1500
		let notifEl = DomHelper.createDivWithClass("notification")
		notifEl.innerHTML = message
		document.body.appendChild(notifEl)
		window.setTimeout(() => document.body.removeChild(notifEl), time)
	}
}
