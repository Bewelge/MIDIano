import { Render } from "./Rendering/Render.js"
import { Player } from "./Player.js"
import { UI } from "./ui/UI.js"
import { InputListeners } from "./InputListeners.js"
import { getLoader } from "./ui/Loader.js"

/**
 * TODOs:
 * - piano zoom
 * - channel menu
 * - accessability
 * - load from URL
 * - added song info to "loaded songs"
 * - add more starting colors
 * -
 *
 * - implement configurable ADSR + maybe custom wave functions
 * - make instrument choosable for tracks
 * -
 * - implement control messages of the other two pedals
 * -
 * - settings for playalong:
 * 		- accuracy needed
 * 		- different modes
 *
 *
 * - click piano = hit key
 * - render note keys on each note/ on piano
 * - Metronome
 *
 * bugs:
 * - pause on loading soundfont doesnt seem to work. Clean up all pause calls
 * - clean up getRenderInfos -> refactor into class thats called in Render.js before rendering and passed to all renderers as necessary
 * - fix track ui
 * - fix the minimize button
 * - Fix iOS
 * - Fix fullscreen on mobile
 * - Custom UI for Mobile
 * - fix piano key hightlighting
 */
var player, ui, player, loading, listeners

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
	renderLoop()

	loadStartingSong()
}

var render
function renderLoop() {
	let playerState = player.getState()
	render.render(playerState)
	window.requestAnimationFrame(renderLoop)
}
async function loadStartingSong() {
	let domain = window.location.href
	let url = "https://midiano.com/mz_331_3.mid?raw=true" //"https://bewelge.github.io/piano-midi.de-Files/midi/alb_esp1.mid?raw=true" //
	if (domain.split("github").length > 1) {
		url = "https://Bewelge.github.io/MIDIano/mz_331_3.mid?raw=true"
	}

	loadSongFromURL(url) // Local: "../mz_331_3.mid")
}
async function loadSongFromURL(url) {
	getLoader().setLoadMessage("Loading Song from" + url)
	let response = fetch(url, {
		method: "GET"
	}).then(response => {
		console.log(response.headers)
		let filename = title || url
		response.blob().then(blob => {
			let reader = new FileReader()
			reader.onload = function (theFile) {
				player.loadSong(reader.result, filename, () => {})
			}
			reader.readAsDataURL(blob)
		})
	})
}
