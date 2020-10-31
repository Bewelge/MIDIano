import { Render } from "./Rendering/Render.js"
import { Player } from "./Player.js"
import { UI } from "./UI.js"
import { InputListeners } from "./InputListeners.js"

/**
 * TODOs:
 * - piano zoom
 * - menu settings
 * - channel menu
 * - accessability
 * - loading app display
 * - dragndropfile
 * - load from URL
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
	ui = new UI(player, render)
	listeners = new InputListeners(player, ui, render)
	drawIt()

	loadSongFromFile()
}

var render
function drawIt() {
	let playerState = player.getState()
	render.render(playerState)
	window.requestAnimationFrame(drawIt)
}
async function loadSongFromFile() {
	loadSongFromURL("https://Bewelge.github.io/MIDIano/mz_331_3.mid?raw=true") // Local: "../mz_331_3.mid")
}
async function loadSongFromURL(url) {
	let response = fetch(url, {
		method: "GET" // *GET, POST, PUT, DELETE, etc.
	})
	await (await response).blob().then(res => {
		let reader = new FileReader()
		let fileName = url
		reader.onload = function (theFile) {
			player.loadSong(reader.result, fileName, () => {})
		}
		reader.readAsDataURL(res)
	})
}
