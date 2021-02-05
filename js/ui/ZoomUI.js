import { getPlayer } from "../player/Player.js"
import { DomHelper } from "./DomHelper.js"

export class ZoomUI {
	constructor() {}
	getContentDiv(render) {
		let cont = DomHelper.createDivWithClass("zoomGroup btn-group")
		//zoomIn
		cont.appendChild(
			DomHelper.createGlyphiconButton("zoomInButton", "zoom-in", () =>
				render.renderDimensions.zoomIn()
			)
		)

		//zoomOut
		cont.appendChild(
			DomHelper.createGlyphiconButton("zoomOutButton", "zoom-out", () =>
				render.renderDimensions.zoomOut()
			)
		)
		//moveLeft
		cont.appendChild(
			DomHelper.createGlyphiconButton("moveViewLeftButton", "arrow-left", () =>
				render.renderDimensions.moveViewLeft()
			)
		)

		//moveRight
		cont.appendChild(
			DomHelper.createGlyphiconButton("moveViewLeftButton", "arrow-right", () =>
				render.renderDimensions.moveViewRight()
			)
		)
		const fitSongButton = DomHelper.createTextButton(
			"fitSongButton",
			"Fit Song",
			() => render.renderDimensions.fitSong(getPlayer().song.getNoteRange())
		)
		fitSongButton.style.float = "none"
		//FitSong
		cont.appendChild(fitSongButton)
		//ShowAll
		cont.appendChild(
			DomHelper.createTextButton("showAllButton", "Show All", () =>
				render.renderDimensions.showAll()
			)
		)
		return cont
	}
}
