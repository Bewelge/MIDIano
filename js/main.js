import { Render } from "./Rendering/Render.js"
import { UI } from "./ui/UI.js"
import { InputListeners } from "./InputListeners.js"
import { getLoader } from "./ui/Loader.js"
import { getPlayer, getPlayerState } from "./player/Player.js"

/**
 * DONES:
 * - piano zoom - 29.1 Done - Implement fit to song on new song callback
 * - clean up getRenderInfos - DONE 29.01
 *
 * - click piano = hit key - DONE 04.02
 * - implement configurable ADSR - DONE 04.02
 * - render note keys on each note/ on piano - DONE 04.02
 *
 * TODOs:
 * - channel menu
 * - accessability
 * - load from URL
 * - added song info to "loaded songs"
 * - add more starting colors
 * -
 *
 * - make instrument choosable for tracks
 * -
 * - implement control messages of the other two pedals
 * -
 * - settings for playalong:
 * 		- accuracy needed
 * 		- different modes
 *
 * - Metronome
 *
 * - Update readme - new screenshot, install/ run instructions
 * - Choose License
 *
 * bugs:
 * - fix track ui
 * - fix the minimize button
 * - Fix iOS
 * - Fix fullscreen on mobile
 * - Custom UI for Mobile
 * - fix piano key hightlighting
 */
let ui
let loading
let listeners

window.onload = async function () {
	await init()
	loading = true

	//	loadSongFromURL("http://www.piano-midi.de/midis/brahms/brahms_opus1_1_format0.mid")
}

async function init() {
	render = new Render()
	ui = new UI(render)
	listeners = new InputListeners(ui, render)
	renderLoop()

	loadStartingSong()
}

let render
function renderLoop() {
	render.render(getPlayerState())
	window.requestAnimationFrame(renderLoop)
}
async function loadStartingSong() {
	const domain = window.location.href
	let url = "https://midiano.com/mz_331_3.mid?raw=true" // "https://bewelge.github.io/piano-midi.de-Files/midi/alb_esp1.mid?raw=true" //
	if (domain.split("github").length > 1) {
		url = "https://Bewelge.github.io/MIDIano/mz_331_3.mid?raw=true"
	}

	loadSongFromURL(url, "Mozart KV 331 3rd Movement") // Local: "../mz_331_3.mid")
}
async function loadSongFromURL(url, title) {
	getLoader().setLoadMessage(`Loading Song from${url}`)
	const response = fetch(url, {
		method: "GET"
	}).then(response => {
		const filename = title || url
		response.blob().then(blob => {
			const reader = new FileReader()
			reader.onload = function (theFile) {
				getPlayer().loadSong(reader.result, filename, () => {})
			}
			reader.readAsDataURL(blob)
		})
	})
}
