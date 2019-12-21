/**
 * TODOs:
 * - song progress bar make pretty
 * - piano zoom
 * - menu controls
 * - menu settings
 * - loaded songs display
 * - track control
 * - loading song display
 * - loading app display
 * - dragndropfile
 */
var soundfontLoader, player, currentSong;
var channels = []
var player

window.onload = async function () {
	await init();
	loading = true;
//	loadSongFromURL("http://www.piano-midi.de/midis/brahms/brahms_opus1_1_format0.mid")
}

async function init() {





	
	document.body.addEventListener("wheel",myMouseWheel)

	player = new Player()
	console.log("Player created.")

	UI  = new UI(player)
	render = new Render(player)
	drawIt()

}




MIDI = {}
MIDI['SoundFont'] = {}
soundfontName = "MusyngKite"
soundfonts = {}
soundfonts[soundfontName] = {}




var pausePlayStop = async function (stop) {
	var d = document.getElementById("pausePlayStop");
	if (stop) {
		player.stop()
		d.src = "./images/play.png";
	} else
	if (!player.paused) {
		d.src = "./images/play.png";
		player.pause()
	} else {
		d.src = "./images/pause.png";
		if (player.playing) {
			player.resume()
		} else {

			player.startPlay()
		}




	}
};
var render
function drawIt() {
	render.render()
	window.requestAnimationFrame(drawIt)
}


var delay

function myMouseWheel(event) {
	if (delay) {
		return;
	}
	delay = true;

	let alreadyScrolling = player.scrolling != 0

	// let bool = false;
	// if (!player.paused) {
	// 	bool = true;
	// 	player.pause();
	// }

	let evDel = (event.wheelDelta + 1) / (Math.abs(event.wheelDelta) + 1) * Math.min(500, Math.abs(event.wheelDelta));
	var wheel = (evDel) / Math.abs(evDel) * 500; //n or -n

	player.scrolling -= 0.001*wheel//Math.min(player.endTime, Math.max(0, player.startContextTime + wheel));
	// if (bool) {
	// 	player.resume();

	// }
	if (!alreadyScrolling) {
		player.handleScroll()
	}
	delay = false



}

async function loadSongFromURL(url) {
	let response = fetch(url,
		{
			method: 'GET', // *GET, POST, PUT, DELETE, etc.
			mode: 'no-cors', // no-cors, *cors, same-origin
			
		  });
		  await response.then(res => console.log(res))
	
}





