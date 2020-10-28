import { Render } from "./Rendering/Render.js"
import { Player } from "./Player.js"
import { UI } from "./UI.js"
import { InputListeners } from "./InputListeners.js"

/**
 * TODOs:
 * - piano zoom
 * - menu settings
 * - channel menu
 * - loading app display
 * - dragndropfile
 * - load from URL
 * - add example song
 */
var soundfontLoader, player, ui, player, loading, listeners
var channels = []

window.onload = async function () {
	await init()
	loading = true
	//	loadSongFromURL("http://www.piano-midi.de/midis/brahms/brahms_opus1_1_format0.mid")
}

async function init() {
	player = new Player()
	console.log("Player created.")

	render = new Render(player)
	ui = new UI(player)
	listeners = new InputListeners(player, ui, render)
	drawIt()
}

var render
function drawIt() {
	let playerState = player.getState()
	render.render(playerState)
	window.requestAnimationFrame(drawIt)
}

async function loadSongFromURL(url) {
	let response = fetch(url, {
		method: "GET", // *GET, POST, PUT, DELETE, etc.
		mode: "no-cors" // no-cors, *cors, same-origin
	})
	await response.then(res => console.log(res))
}
