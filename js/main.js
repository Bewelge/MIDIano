var soundfontLoader, player, currentSong;
var channels = []
var player

window.onload = async function () {
	init();
	loading = true;
}

async function init() {

	window.addEventListener("keydown", function (e) {
		if (e.code == "Space") {
			if (player.playing) {
				player.pause();
			} else {
				player.resume();
			}
		}
	})



	document.getElementById('files').addEventListener('change', handleFileSelect, false);
	document.body.addEventListener("wheel",myMouseWheel)

	player = new Player()
	console.log("Player created.")

	render = new Render(player)
	drawIt()

}




MIDI = {}
MIDI['SoundFont'] = {}

async function loadSong(theSong) {
	let midiFile = await MidiLoader.loadFile(theSong);
	currentSong = new Song(midiFile)
	player.setSong(currentSong)
	//filter instruments we've loaded already and directly map onto promise
	let neededInstruments = currentSong.getAllInstruments()
		.filter(instrument => !MIDI.SoundFont.hasOwnProperty(instrument))
		.map(instrument => SoundfontLoader.loadInstrument(instrument))
	await Promise.all(neededInstruments)
	return await SoundfontLoader.getBuffers(player.getContext()).then((buffers) => {
		console.log("Buffers loaded")
		player.setBuffers(buffers);
	})
}


var pausePlayStop = async function (stop) {
	var d = document.getElementById("pausePlayStop");
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

	console.log(123)

	let bool = false;
	if (!player.paused) {
		bool = true;
		player.pause();
	}

	let evDel = (event.wheelDelta + 1) / (Math.abs(event.wheelDelta) + 1) * Math.min(500, Math.abs(event.wheelDelta));
	var wheel = (evDel) / Math.abs(evDel) * 500; //n or -n

	player.startContextTime += 0.001*wheel//Math.min(player.endTime, Math.max(0, player.startContextTime + wheel));
	if (bool) {
		player.resume();

	}
	delay = false



}



function handleFileSelect(evt) {
	var files = evt.target.files;
	for (var i = 0, f; f = files[i]; i++) {
		let reader = new FileReader();
		/*let reader2 = new FileReader();*/
		reader.onload = function (theFile) {
			song.push(reader.result)
			loadSong(song[song.length - 1]);

			//Add loaded file to song[];
		};
		/*reader2.onload = function(theFile) {
			decode(reader2.result);
			console.log(123);
		}*/
		// Read in the file as a data URL.
		reader.readAsDataURL(f);
		/*reader2.readAsArrayBuffer(f);*/
	}
}



