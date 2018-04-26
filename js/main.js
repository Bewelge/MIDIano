if (typeof(console) === "undefined") var console = {
	log: function() {}
};
// Toggle between Pause and Play modes.
var lastTick = 0;
var ticker = 0;
var theLoop;
var width;
var height;
var canvas, ctx;
var pCanvas, pCtx;
var pCanvas2, pCtx2;
var canvasFg, ctxFG;
var lastNow = 0;
var wKeyW;
var wKeyH;
var bKeyW;
var bKeyH;
var curInd = 0;
var curTime = 0;
var curTimeDif = 0;
var lowestDif = 1E100;
var myDt;
var player;
var songid = 0;
var keyDims = [];
var midiFile;
var allNotes = [];
var tracks = [];
var colors = [];
var speed = 1;
var delay;
var saveSound;
var mediaRecorder;
var chunks = [];
var videoTime = -1000;
var canvasRecorder;
var mode = "piano";
var particles=false;
var tracks=[];
var tracksCollapsed = true;
var loading = false;
var trackVolumes=[];
window.onload = function() {

	///
	//MIDI.loader = new sketch.ui.Timer;
	initCanvas();
	loading = true;
	MIDI.loadPlugin({
		onprogress: function(state, progress) {
			//MIDI.loader.setValue(progress * 100);
		},
		onsuccess: function() {
			/// this is the language we are running in
			var title = document.getElementById("title");
			loading=false;

			
			/// this sets up the MIDI.Player and gets things going...
			player = MIDI.Player;
			player.timeWarp = 1; // speed the song is played back

			player.loadFile(song[0], function() {
				myDt = player.data.slice(0);
				midiFile = MidiFile(player.currentData);
				speed = player.BPM * midiFile.header.ticksPerBeat / 60000000;
				let sumTimeStamp = 0;
				for (let i = 0; i < myDt.length; i++) {
					sumTimeStamp += myDt[i][1]; //0].event.deltaTime;
					myDt[i][0].event.timeStamp = sumTimeStamp;
				}
				createNoteArray();
				colors = [];
				for (let i = 0; i < midiFile.header.trackCount; i++) {
					colors.push(getColor(i));
				}
				player.currentTime = 000;
				//player.startDelay=2000;

				
				player.setAnimation(function(data) {
					draw2(data.now);
				});
				fillTracks();

			},function(state,prog){console.log(state,prog)});


		}
	});
}

function initCanvas() {
	width = window.innerWidth || document.documentElement.clientWidth / 1 || document.body.clientWidth
	height = window.innerHeight || document.documentElement.clientHeight / 1 || document.body.clientHeight / 1;
	width = Math.floor(width);
	height = Math.floor(height);
	canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	canvas.style.position = "absolute";
	canvas.style.top = "0px";
	canvas.style.left = "0px";
	canvas.style.zIndex = "-1";
	ctx = canvas.getContext("2d");
	document.body.appendChild(canvas);

	window.addEventListener("keydown",function(e){
		if (e.code == "Space") {
			if (player.playing) {
				player.pause();
			} else {
				player.resume();
			}
		}
	})

		canvasLines = document.createElement("canvas");
		canvasLines.width = width;
		canvasLines.height = height;
		canvasLines.style.position = "absolute";
		canvasLines.style.top = "0px";
		canvasLines.style.left = "0px";
		canvasLines.style.zIndex = "-3";
		ctxLines = canvasLines.getContext("2d");
		document.body.appendChild(canvasLines);
	
	

		pCanvas = document.createElement("canvas");
		pCanvas.width = width;
		pCanvas.height = height * 0.1;
		pCanvas.style.position = "absolute";
		pCanvas.style.bottom = "0px";
		pCanvas.style.left = "0px";
		pCanvas.style.zIndex = "-2";
		pCtx = pCanvas.getContext("2d");
		document.body.appendChild(pCanvas);
	
	

		pCanvas2 = document.createElement("canvas");
		pCanvas2.width = width;
		pCanvas2.height = height * 0.1;
		pCanvas2.style.position = "absolute";
		pCanvas2.style.bottom = "0px";
		pCanvas2.style.left = "0px";
		pCanvas2.style.zIndex = "0";
		pCtx2 = pCanvas2.getContext("2d");
		document.body.appendChild(pCanvas2);
	
	

		canvasFg = document.createElement("canvas");
		canvasFg.width = width;
		canvasFg.height = height * 0.1;
		canvasFg.style.position = "absolute";
		canvasFg.style.bottom = "0px";
		canvasFg.style.left = "0px";
		canvasFg.style.zIndex = "1";
		ctxFG = canvasFg.getContext("2d");
		document.body.appendChild(canvasFg);
	
	ctxFG.globalAlpha = 0.5;


	setKeyDims();
	

	

		drawPiano();
		drawBGLines();
		canvas.addEventListener("mousewheel", myMouseWheel);
		
	
	
	
	
	
	

	document.getElementById('files').addEventListener('change', handleFileSelect, false);


	//player.resume();
	//capturer.start();
	/*canvasRecorder = RecordRTC(canvas, {
	    type: 'canvas'
	});
	canvasRecorder.startRecording();
	playAndRecordNoSound();*/
	tick();
}
function fillTracks() {
	let tr = document.getElementById("tracks");
	if (tr) {
		tr.innerHTML = "";
	} else {
		tr = document.createElement("div");
		tr.id = "tracks";
		tr.className = "tracks";
		tr.style.height = height*0.7 + "px";
		tr.style.position = "absolute";
		tr.style.left = "5px";
		tr.style.top = "5%";
		tr.style.width = width * 0.1 + "px"; 
		document.body.appendChild(tr);
	}


	let trackList = createDiv("trackList","trackList");

	let trB = createDiv("trackB","trackB");
	trB.style.width = width*0.1+"px";
	trB.innerHTML = "Tracks";
	trB.addEventListener("click",function() {
		if (tracksCollapsed) {
			tracksCollapsed=false;
			$(trackList).slideDown();
		} else {
			tracksCollapsed=true;
			$(trackList).slideUp();
		}
	})
	trackVolumes=[];
	let offset=0;
	for (let i = 0; i < midiFile.tracks.length;i++) {
		let bool = false;
		let name = "";
		for (let j =0;j<midiFile.tracks[i].length;j++) {
			if (midiFile.tracks[i][j].subtype == "noteOn") {
				bool=true;
				break;
			} else if (midiFile.tracks[i][j].subtype == "trackName") {
				if (name.split("").length>0) {
					name+= "</br>";
				}
				name += midiFile.tracks[i][j].text 
			}
		}
		trackVolumes.push(50);
		if (bool) {
			console.log(name);
			$(trackList).append(createTrackDiv(i,offset,name));
		} else {
			offset++

		}
	}
	if (tracksCollapsed) {
		$(trackList).slideUp();
	}

	tr.appendChild(trB);
	tr.appendChild(trackList);

	//$("body").append(tr);
}
function createTrackDiv(i,offset,name) {
	let outer = createDiv("outerTrack"+i,"outerTrack")
	
	outer.style.backgroundColor = "rgba("+colors[i][0]+","+colors[i][1]+","+colors[i][2]+","+1+")";
	outer.style.width = width * 0.1 + "px";

	let inner = createDiv("innerTrack"+(i-offset),"innerTrack");
	//inner.innerHTML = "Hide";
	//inner.style.backgroundColor = "white";
	inner.style.width = "100%";

	let hideBut = createDiv("hideBut"+(i-offset),"hideBut");
	hideBut.innerHTML = "Hide";
	hideBut.style.backgroundColor="rgba(150,150,150,1)";

	//hideBut.style.width = width * 0.1 + "px";

	let vol = document.createElement("input");
	vol.type = "range";
	vol.min = 0;
	vol.max = 100;
	vol.value = MIDI.getVolumeControl(i);
	vol.label = "Volume";
	vol.addEventListener("change",function(val) {
		let bool=false;
		if (player.playing) bool=true;
		player.pause();
		trackVolumes[i]=parseInt(val.srcElement.value);
		//MIDI.setChannelVolume(i,parseInt(val.srcElement.value),0);
		//MIDI.WebAudio.setVolumeControl(i,parseInt(val.srcElement.value),0);


		if (bool) player.resume();
		
	})
	vol.style.padding = "0px";
	vol.style.margin = "0px";
	vol.style.width ="100%";

	inner.appendChild(hideBut);
	inner.appendChild(vol);

	let outerTitle = createDiv("trackTitle"+i-offset,"trackTitle");
	if (name.split("").length>0) {
		outerTitle.innerHTML = name;
	} else {
		outerTitle.innerHTML = "Track " + (i-offset);
	}

	hideBut.addEventListener("click",function(ev) {

		if (tracks[i].hidden) {
			$(hideBut).html("Hide");
			tracks[i].hidden = false;
		} else {
			$(hideBut).html("Show");
			tracks[i].hidden = true;
		}
	}, i)

	outer.appendChild(outerTitle);
	outer.appendChild(inner);
	return outer;
}


function drawBGLines() {
	ctxLines.fillStyle="rgba(50,50,50,1)";
	ctxLines.fillRect(0,0,width,height);
	ctxLines.strokeStyle = "rgba(5,5,5,1)";
	ctxLines.lineWidth = 0.5;
	ctxLines.beginPath();
	for (let i = 0; i < 10; i++) {
		ctxLines.moveTo(Math.floor(wKeyW * 7 * i + wKeyW * 3) + 1, 0);
		ctxLines.lineTo(Math.floor(wKeyW * 7 * i + wKeyW * 3) + 1, height );


	}
	ctxLines.stroke();
	ctxLines.closePath();

	ctxLines.fillStyle = "rgba(255,255,255,0.05)";


	for (let j = 0; j < 88; j++) {
		let dims = keyDims[j];
		if (!dims.black) {
			let rgr = ctxLines.createLinearGradient(width/2,0,width/2,height);
			let col = Math.floor(125 - (((j + 9) % 12) + 1) / 12 * 125);
			rgr.addColorStop(0,"black");
			rgr.addColorStop(1,"rgba(" + col + "," + col + "," + col + ",0.4)");
			ctxLines.fillStyle = rgr;//"rgba(" + col + "," + col + "," + col + ",0.4)";
			ctxLines.fillRect(dims.noteX, 0, dims.noteW, height );

		}
	}



	ctxLines.stroke();
	ctxLines.closePath();
}
//only done once. Hit keys are drawn in color on Top (white on pCtx, black on pCtx2)
function drawPiano() {
	pCtx.fillStyle="rgba(0,0,0,0.5)";
	pCtx.fillRect(0,0,width,height*0.1);
	pCtx.fillStyle="rgba(255,255,255,0.5)";
	pCtx.fillRect(0,0,width,height);
	let rgr = pCtx.createLinearGradient(width/2,-height*0.05,width/2,height*0.1);
	rgr.addColorStop(1,"white");
	rgr.addColorStop(0,"black");
	pCtx.fillStyle = rgr;
	for (let i = 0; i < 88; i++) {
		let dims = getKeyDim(i);
		keyDims.push(dims);
		if (!dims.black) {
			//pCtx.fillRect(dims.x + 1, dims.y + 2, dims.w - 2, dims.h);
			roundRect(pCtx,dims.x + 1, dims.y + 2, dims.w - 2, dims.h,dims.w/10);
			pCtx.fill();
		}
	}
	pCtx2.fillStyle = "rgba(0,0,0,01)";
	for (let i = 0; i < 88; i++) {
		let dims = keyDims[i];
		if (dims.black) {
			roundRect(pCtx2,dims.x, dims.y, dims.w, dims.h,dims.w/3);
			pCtx2.fill();
			//pCtx2.fillRect(dims.x, dims.y, dims.w, dims.h);
		}
	}
	ctx.fillStyle = "rgba(0,0,0,1)";
}
var whiteNotesToDraw = [];
var blackNotesToDraw = [];
var splatters=[];
function drawSplatter() {
	if (!particles) return;
	for (let key = splatters.length-1; key>=0;key--) {
		splatters[key][5]--
		if (splatters[key][5]<=0 || splatters.length>1000) {
			splatters.splice(key,1);
		} else {
			if (splatters[key][4]>Math.PI*1.5 ||splatters[key][4] < Math.PI*0.5) {
				splatters[key][4]+=0.1;
			} else {
				splatters[key][4]-=0.1;
			}
			splatters[key][0]+= splatters[key][6] * Math.cos(splatters[key][4]);
			splatters[key][1]+= splatters[key][6] * Math.sin(splatters[key][4]);
			ctx.fillStyle=splatters[key][3];
			ctx.beginPath();
			ctx.arc(splatters[key][0],splatters[key][1],splatters[key][2],0,Math.PI*2,0);
			//ctx.translate(splatters[key][0],splatters[key][1])
			//ctx.rect(splatters[key][0],splatters[key][1],1,1);
			ctx.closePath();
			ctx.fill();
		}
	}
}
function drawSplatter2() {
	if (!particles) return;
	ctx.globalAlpha=0.2+Math.random();
	for (let key = splatters.length-1; key>=0;key--) {
		splatters[key][5]--
		if (splatters[key][5]<=0 || splatters.length>1000) {
			splatters.splice(key,1);
		} else {
			for (let kei = splatters.length-1; kei>=0;kei--) {
				if (key != kei) {
					let dis = Distance(splatters[key][0],splatters[key][1],splatters[kei][0],splatters[kei][1]);
					if (dis < 20) {
						let ang = angle(splatters[key][0],splatters[key][1],splatters[kei][0],splatters[kei][1]);
						if (splatters[key][4]>Math.PI*1.5 ||splatters[key][4] < Math.PI*0.5) {
							splatters[key][4]+=0.1;
						} else {
							splatters[key][4]-=0.1;
						}
						splatters[key][0]+= splatters[key][6] * Math.cos(splatters[key][4]);
						splatters[key][1]+= splatters[key][6] * Math.sin(splatters[key][4]);
						ctx.fillStyle=splatters[key][3];
						ctx.strokeStyle=splatters[key][3];
						ctx.lineWidth = Math.random()*3;
						ctx.beginPath();
						ctx.moveTo(splatters[key][0],splatters[key][1])
						ctx.lineTo(splatters[kei][0],splatters[kei][1]);
						//ctx.arc(splatters[key][0],splatters[key][1],splatters[key][2],0,Math.PI*2,0);
						//ctx.translate(splatters[key][0],splatters[key][1])
						//ctx.rect(splatters[key][0],splatters[key][1],1,1);
						ctx.closePath();
						ctx.stroke();
						
					}
				}
			}
		}
	}
	ctx.globalAlpha=1
}
function drawTempoLines(now) {
	let rest = -(now % 2);

	ctx.strokeStyle = "rgba(255,255,255,0.25)";
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	for (let i = 0; i < 0 + 7; i += 1) {
		ctx.moveTo(0, height * 0.9 - rest / (5) * height - i * 2 /*seconds*/ / 5 * height);
		ctx.lineTo(width, height * 0.9 - rest / (5) * height - i * 2 /*seconds*/ / 5 * height);
	}
	ctx.stroke();
	ctx.closePath();
}

function actuallyDraw() {
	let w = wKeyW;
	for (let i = 0; i < whiteNotesToDraw.length; i++) {
		let note = whiteNotesToDraw[i];
		ctx.fillStyle = note.fs
		ctx.beginPath();
		roundRect(ctx,keyDims[note.noteNum].noteX,
			note.y,
			keyDims[note.noteNum].noteW,
			Math.min(note.h, height * 0.9 - note.y),
			Math.min(Math.min(note.h, height * 0.9 - note.y),keyDims[note.noteNum].noteW)/3);
		/*ctx.rect(keyDims[note.noteNum].noteX,
			note.y,
			keyDims[note.noteNum].noteW,
			Math.min(note.h, height * 0.9 - note.y));*/
		ctx.fill();
		//ctx.stroke();
		ctx.closePath();

		if (note.played) {
			splatters.push([keyDims[note.noteNum].noteX+keyDims[note.noteNum].noteW*Math.random(),height*0.9,Math.ceil(Math.random()*1.2),note.fs,Math.random()*Math.PI*2,10,1+Math.random()*3]);
			ctx.globalAlpha = 0.5;
			ctx.beginPath();
			roundRect(ctx,keyDims[note.noteNum].x,
				height * 0.9+2,
				w,
				keyDims[note.noteNum].h,
				Math.min(keyDims[note.noteNum].h,w)/3);
			
			ctx.fill();
			ctx.closePath();
			/*ctx.fillRect(
				keyDims[note.noteNum].x,
				height * 0.9,
				w,
				keyDims[note.noteNum].h);*/
			ctx.globalAlpha = 1;
		}
	}
	whiteNotesToDraw = [];

	w = bKeyW - 2;
	for (let i = 0; i < blackNotesToDraw.length; i++) {
		let note = blackNotesToDraw[i];
		ctx.fillStyle = note.fs
		ctx.beginPath();
		roundRect(ctx,keyDims[note.noteNum].noteX,
			note.y,
			keyDims[note.noteNum].noteW,
			Math.min(note.h, height * 0.9 - note.y),
			Math.min(Math.min(note.h, height * 0.9 - note.y),(keyDims[note.noteNum].noteW))/3);
		/*ctx.rect(keyDims[note.noteNum].noteX,
			note.y,
			keyDims[note.noteNum].noteW,
			Math.min(note.h, height * 0.9 - note.y));*/

		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		/*ctx.fillRect(keyDims[noteNum].noteX,
			top.y,
			keyDims[noteNum].noteW,
			Math.min(top.h,height*0.9-top.y));*/
		ctxFG.fillStyle = note.fs;
		if (note.played) {

				splatters.push([keyDims[note.noteNum].noteX+keyDims[note.noteNum].noteW*Math.random(),height*0.9,(Math.random()*1.2),note.fs,Math.random()*Math.PI*2,20,1+Math.random()*3]);
				/*ctxFG.fillRect(
					keyDims[note.noteNum].x,
					0,
					keyDims[note.noteNum].w,
					keyDims[note.noteNum].h);*/
				ctxFG.beginPath();

			
				roundRect(ctxFG,keyDims[note.noteNum].x,
					0,
					keyDims[note.noteNum].w,
					keyDims[note.noteNum].h,
				Math.min(keyDims[note.noteNum].h,w)/3);
				ctxFG.fill();
							
				ctxFG.closePath();	
			
		}
	}
	blackNotesToDraw = [];
	drawSplatter();
	drawSplatter2();
}
var drawSquares=false;

function draw2(curTime) {
	ctx.clearRect(0, 0, width, height);
	ctxFG.clearRect(0, 0, width, height * 0.1);

	drawTempoLines(curTime);

	ctx.lineWidth = 1;
	if (player.endTime == curTime) {
		return;
	}

	let now = curTime * 1000;
	for (let i = Math.floor(curTime); i < Math.floor(curTime) + 10; i++) {
		if (!allNotes[i]) {
			continue;
		}
		for (let k = 0; k < allNotes[i].length; k++) {
			if (tracks[allNotes[i][k].track].hidden) {
				continue;
			}
			let on = allNotes[i][k].on;
			let off = allNotes[i][k].off;
			let noteNum = allNotes[i][k].num;
			let black = false;
			let played = false;
			let fs = null;
			let top = getNoteHeightDim(
				now,
				on,
				off);

			fs = getKeyColor(allNotes[i][k].track, noteNum, on - now, keyDims[noteNum].black);

			if (keyDims[noteNum].black) {
				black = true;
			}
			if (off < now) {
				continue;
			}
			if (on < now && off > now) {
				played = true;
			}
			if (black) {
				blackNotesToDraw.push({
					x: keyDims[noteNum].noteX,
					y: top.y,
					w: keyDims[noteNum].noteW,
					h: Math.min(top.h, height * 0.9 - top.y),
					noteNum: noteNum,
					black: black,
					played: played,
					fs: fs
				})
			} else {
				whiteNotesToDraw.push({
					x: keyDims[noteNum].noteX,
					y: top.y,
					w: keyDims[noteNum].noteW,
					h: Math.min(top.h, height * 0.9 - top.y),
					noteNum: noteNum,
					black: black,
					played: played,
					fs: fs
				})
			}
		}
	}
	actuallyDraw();
}

function roundRect(ctx, x, y, width, height, radius) {
	
	if (typeof radius === 'undefined') {
		radius = 5;
	}
	if (typeof radius === 'number') {
		radius = {
			tl: radius,
			tr: radius,
			br: radius,
			bl: radius
		};
	} else {
		var defaultRadius = {
			tl: 0,
			tr: 0,
			br: 0,
			bl: 0
		};
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side];
		}
	}
	
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	
	
	ctx.closePath();

}
var mousePulse=0;
function tick() {
	var now = window.performance.now(); // current time in ms

	var deltaTime = now - lastTick; // amount of time elapsed since last tick

	lastTick = now;

	if (loading) {
		ctx.clearRect(0,0,width,height);
		let str = "Loading . . . . . .";
		let wd = ctx.measureText(str).width;
		str = "Loading";

		mousePulse=(mousePulse+1)%30;
		ctx.fillStyle="grey";
		ctx.fillRect(width/2-wd/2-10,height/2-13,wd+20,26);
		ctx.fillStyle="black";
		ctx.fillRect(width/2-wd/2-5,height/2-8,wd+10,16);

		ctx.fillStyle="white";
		for (let k=0;k<mousePulse/5;k++) {
			str+=" .";
		}
		ctx.fillText(str,width/2-wd/2,height/2+3);
	}

	ticker += deltaTime;

	theLoop = window.requestAnimationFrame(tick);

}

//Create array with one entry for each second in song. with all notes for each second within.
function createNoteArray() {
	allNotes = [];
	/*loop0:
	for (let h = 0; h < midiFile.tracks.length; h++) {
		let dt = midiFile.tracks[h];*/
	let dt = player.data;
	loop1:
		for (let i = 0; i < dt.length; i++) {
			if (dt[i][0].event.subtype == "noteOn") {
				let num = dt[i][0].event.noteNumber;

				searchForNextOff(i, num);

			}
		}
		for (let i = 0 ; i < midiFile.tracks.length; i++) {
			tracks.push({hidden:false});
		}
	/*}*/
}

function searchForNextOff(i, num) {
	let dt = player.data;
	for (let j = i + 1; j < dt.length; j++) {
		if (dt[j][0].event.noteNumber == num && dt[j][0].event.subtype == "noteOff") {
			let sec = Math.floor(dt[j][0].event.timeStamp / 1000);
			while (!allNotes[sec]) {
				allNotes.push([]);
			}

			allNotes[sec].push({
				num: num - 21,
				on: dt[i][0].event.timeStamp,
				off: dt[j][0].event.timeStamp,
				track: dt[j][2]
			});
			break;
			//allNotes.push({num:num,on:dt[i][0].event.timeStamp,off:dt[j][0].event.timeStamp});
			/*continue loop1;*/
		} else if (dt[j][0].event.noteNumber == num && dt[j][0].event.subtype == "noteOn") {
			let sec = Math.floor(dt[j][0].event.timeStamp / 1000);
			while (!allNotes[sec]) {
				allNotes.push([]);
			}
			allNotes[sec].push({
				num: num - 21,
				on: dt[i][0].event.timeStamp,
				off: dt[j][0].event.timeStamp,
				track: dt[j][2]
			});
			searchForNextOff(j, num);
			break;
			// allNotes.push({num:num,on:dt[i][0].event.timeStamp,off:dt[j][0].event.timeStamp});
			/*continue loop2;*/
		}
	}
}
//set general widths/heights of keys/notes. Only caled on init.
function setKeyDims() {
	// white keys are x2 width of black keys.
	wKeyW = (width / (52));
	bKeyW = wKeyW / 1.6;
	wKeyH = Math.max(60, height * 0.1);
	bKeyH = Math.max(45, height * 0.075);
}
//function to get current y pos of note and its height.
function getNoteHeightDim(now, start, end) {
	let y = height * 0.9 - (end - now) / (5000) * height;
	return {
		y: y + 0.5,
		h: (end - start) / (5000) * height - 1,
	}

}
//function to get position and dimensions of a note
function getNoteDim(key, now, start, end) {
	key -= 21;
	let dur = end - start;
	//check whether key is black;
	let blackKey = 0;
	if (
		((key + 11) % 12 == 0) ||
		((key + 8) % 12 == 0) ||
		((key + 6) % 12 == 0) ||
		((key + 3) % 12 == 0) ||
		((key + 1) % 12 == 0)
	) {

		blackKey = 1;
	}
	//for xPos only the amount of white keys matter since the black are placed on top.
	let x = (key -
		Math.floor(Math.max(0, (key + 11)) / 12) -
		Math.floor(Math.max(0, (key + 8)) / 12) -
		Math.floor(Math.max(0, (key + 6)) / 12) -
		Math.floor(Math.max(0, (key + 3)) / 12) -
		Math.floor(Math.max(0, (key + 1)) / 12)
	) * wKeyW - wKeyW / 4 * blackKey;
	let y = height * 0.9 - (end - now) / 5000 * height;
	return {
		x: x + 1,
		y: y,
		w: wKeyW - (blackKey * wKeyW / 2) - 2,
		h: dur / 5000 * height,
		black: blackKey,
	}

}
//Function to get position of piano key (on the actual piano)
function getKeyDim(key) {
	//check whether key is black;
	let blackKey = 0;
	if (
		((key + 11) % 12 == 0) ||
		((key + 8) % 12 == 0) ||
		((key + 6) % 12 == 0) ||
		((key + 3) % 12 == 0) ||
		((key + 1) % 12 == 0)
	) {

		blackKey = 1;
	}
	//for xPos only the amount of white keys matter since the black are placed on top.
	let x = (key -
		Math.floor(Math.max(0, (key + 11)) / 12) -
		Math.floor(Math.max(0, (key + 8)) / 12) -
		Math.floor(Math.max(0, (key + 6)) / 12) -
		Math.floor(Math.max(0, (key + 3)) / 12) -
		Math.floor(Math.max(0, (key + 1)) / 12)
	) * wKeyW + (wKeyW - bKeyW / 2) * blackKey;
	let y = 0;
	return {
		x: x,
		y: y,
		w: wKeyW * (1 - blackKey) + (blackKey * bKeyW),
		h: (1 - blackKey) * wKeyH + blackKey * bKeyH,
		noteX: x + 2,
		noteW: wKeyW * (1 - blackKey) + (blackKey * bKeyW) - 4,
		black: blackKey,
	}
}

function loadSong(theSong) {
	loading=true;
	player.clearAnimation();
	player.stop();
	player.removeListener();
	ctx.clearRect(0,0,width,height);
	player.loadFile(theSong, function() {

		myDt = player.data.slice(0);
		midiFile = MidiFile(player.currentData);
		speed = player.BPM * midiFile.header.ticksPerBeat / 60000;
		let sumTimeStamp = 0;
		for (let i = 0; i < myDt.length; i++) {
			sumTimeStamp += myDt[i][1]; //0].event.deltaTime;
			myDt[i][0].event.timeStamp = sumTimeStamp;


		}
		createNoteArray();
		colors = [];
		for (let i = 0; i < midiFile.header.trackCount; i++) {
			colors.push(getColor(i));
		}
		player.currentTime = 00;
		curInd = 0;
		fillTracks();
		loading=false;
		player.setAnimation(function(data) {
					draw2(data.now);
				});
	},function(state,prog){console.log(state,prog)});

}
var pausePlayStop = function(stop) {
	var d = document.getElementById("pausePlayStop");
	if (stop) {
		MIDI.Player.stop();
		curInd = 0;
		d.src = "./images/play.png";
	} else if (MIDI.Player.playing) {
		d.src = "./images/play.png";
		MIDI.Player.pause(true);
	} else {
		d.src = "./images/pause.png";
		MIDI.Player.resume();
	}
};

function getColor(i) {
	return [150 * Math.floor(((i + 1) % 3) / 2), 150 * Math.floor(((i + 2) % 3) / 2), 150 * Math.floor((i % 3) / 2)];
}

function getKeyColor(track, key, dis, black) {
	let val = Math.floor(key - black * 50 + 100 * (Math.max(0, (1 - Math.max(0, dis) / Math.max(0.01, dis)))));
	return "rgba(" +
		Math.max(0, colors[track][0] + val) + "," +
		Math.max(0, colors[track][1] + val) + "," +
		Math.max(0, colors[track][2] + val) + "," +
		(1 - 1 * Math.max(0, dis - 2000) / 2000) + ")";

}



function myMouseWheel(event) {

	event.preventDefault();
	if (delay) {
		return;
	}
	delay = true;


	let bool = false;
	if (player.playing) {
		bool = true;
		player.pause(true);
	}

	let evDel = (event.wheelDelta + 1) / (Math.abs(event.wheelDelta) + 1) * Math.min(500, Math.abs(event.wheelDelta));
	var wheel = (evDel) / Math.abs(evDel) * 500; //n or -n

	player.currentTime = Math.min(player.endTime, Math.max(000, player.currentTime + wheel));
	if (bool) {
		player.resume();

	}

	window.setTimeout(function() {
		delay = false;
	}, 10)

}



function handleFileSelect(evt) {
	var files = evt.target.files;
	for (var i = 0, f; f = files[i]; i++) {
		let reader = new FileReader();
		/*let reader2 = new FileReader();*/
		reader.onload = function(theFile) {
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





function getLowestKey(ev) {
	let lowest = 1e99;
	for (let key in ev) {
		if (key < lowest) {
			lowest = key;
		}
	}
	return lowest;
}

function findLowest() {
	let lowest = 1e100;
	for (let i = 0; i < player.data.length; i++) {
		if (player.data[i]) {}
	}
}

function contains(arr, key) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == key) {
			return true
		}
	}
	return false;
}

function draw(curTime) {
	ctx.clearRect(0, 0, width, height);
	//curTime = player.currentTime;
	let newLowest = 1E100;
	let skip = 0;
	ctx.fillStyle = "rgba(255,255,255,1)";
	ctx.strokeStyle = "rgba(255,255,255,1)";
	ctx.beginPath();
	ctx.moveTo(0, height * 0.9);
	ctx.lineTo(width, height * 0.9);
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
	let now = curTime * 1000; //player.currentTime;
	/*for (key in events) {

		ctx.fillRect(events[key].note*5,height-75,5,75)
	}*/
	if (Object.keys(myDt).length > 0) {
		let i = curInd;
		let totTime = 0;
		while (totTime < speed * 10000 && totTime + now < player.endTime) {

			let dt = myDt[i];
			let dis;
			let dif = now - lastNow;
			totTime += dt[0].event.deltaTime;

			if (dt[0].event.subtype == "noteOn") {

				let j = i + 1;
				let timeDiff = myDt[j][1];
				whileloop:
					for (let k = 0; k < 200 && myDt[j][0].event.noteNumber != dt[0].event.noteNumber; k++) {
						if ((myDt[j][0].event.subtype == "noteOff" &&
								myDt[j][0].event.noteNumber == dt[0].event.noteNumber)) {

							break whileloop;
						}
						j++;
						timeDiff += player.data[j][1];
					}
				if (myDt[j][0].event.noteNumber != dt[0].event.noteNumber) {
					timeDiff = speed * 10000;
				}

				let top = getNoteHeightDim(
					now,
					dt[0].event.timeStamp,
					myDt[j][0].event.timeStamp);

				if (myDt[j][0].event.timeStamp < now && i == curInd) {
					lastNow = dt[0].event.timeStamp;

					curInd++;
					continue;

				}

				// if (dt[0].event.timeStamp < now) {
				// ctx.fillStyle = "rgba(255,0,0,1)";
				// } else {
				ctx.fillStyle = getColor(i); //"rgba(255,255,255,1)";
				// }
				ctx.fillRect(keyDims[dt[0].event.noteNumber - 21].x,
					top.y,
					keyDims[dt[0].event.noteNumber - 21].w,
					top.h);
				if (dt[0].event.timeStamp < now) {
					if (keyDims[dt[0].event.noteNumber - 21].black) {
						ctx.fillStyle = "rgba(255,255,0,1)";

					} else {
						ctx.fillStyle = "rgba(0,255,255,1)";
					}
					ctx.fillRect(keyDims[dt[0].event.noteNumber - 21].x, height * 0.9, keyDims[dt[0].event.noteNumber - 21].w, keyDims[dt[0].event.noteNumber - 21].h);
				}
			} else if (myDt[i][0].event.subType != "noteOn" && myDt[i][0].event.subType != "noteOff") {
				i++;
			} else if (i == curInd) {
				curInd++;
			}
			i++;
		}
	}
}
var saveCtx = new(AudioContext || webkitAudioContext)();

function decode(buffer) {
	saveCtx.decodeAudioData(buffer, split);
}
// STEP 3: Split the buffer --------------------------------------------
function split(abuffer) {

	// calc number of segments and segment length
	var channels = abuffer.numberOfChannels,
		duration = abuffer.duration,
		rate = abuffer.sampleRate,
		segmentLen = 10,
		count = Math.ceil(duration / segmentLen),
		offset = 0,
		block = 10 * rate;
	while (count > 0) {
		count--;
		let obj = bufferToWave(abuffer, offset, block);
		var url = URL.createObjectURL(obj);
		var audio = new Audio(url);
		audio.controls = true;
		audio.volume = 0.5;
		document.body.appendChild(audio);
		offset += block;
	}
}

function bufferToWave(abuffer, offset, len) {

	var numOfChan = abuffer.numberOfChannels,
		length = len * numOfChan * 2 + 44,
		buffer = new ArrayBuffer(length),
		view = new DataView(buffer),
		channels = [],
		i, sample,
		pos = 0;

	// write WAVE header
	setUint32(0x46464952); // "RIFF"
	setUint32(length - 8); // file length - 8
	setUint32(0x45564157); // "WAVE"

	setUint32(0x20746d66); // "fmt " chunk
	setUint32(16); // length = 16
	setUint16(1); // PCM (uncompressed)
	setUint16(numOfChan);
	setUint32(abuffer.sampleRate);
	setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
	setUint16(numOfChan * 2); // block-align
	setUint16(16); // 16-bit (hardcoded in this demo)

	setUint32(0x61746164); // "data" - chunk
	setUint32(length - pos - 4); // chunk length

	// write interleaved data
	for (i = 0; i < abuffer.numberOfChannels; i++)
		channels.push(abuffer.getChannelData(i));

	while (pos < length) {
		for (i = 0; i < numOfChan; i++) { // interleave channels
			sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
			sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
			view.setInt16(pos, sample, true); // update data chunk
			pos += 2;
		}
		offset++ // next source sample
	}

	// create Blob
	return new Blob([buffer], {
		type: "audio/wav"
	});

	function setUint16(data) {
		view.setUint16(pos, data, true);
		pos += 2;
	}

	function setUint32(data) {
		view.setUint32(pos, data, true);
		pos += 4;
	}
}
function angle(p1x, p1y, p2x, p2y) {

	return Math.atan2(p2y - p1y, p2x - p1x);

}
function Distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}
function createDiv(id, className) {
	let but = document.createElement("div");
	but.id = id;
	but.className = className;


	return but;
}