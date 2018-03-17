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
window.onload = function() {

	///
	//MIDI.loader = new sketch.ui.Timer;
	MIDI.loadPlugin({
		soundfontUrl: "http://gleitz.github.io/midi-js-soundfonts/MusyngKite/", //"./soundfont/",//
		onprogress: function(state, progress) {
			//MIDI.loader.setValue(progress * 100);
		},
		onsuccess: function() {
			/// this is the language we are running in
			var title = document.getElementById("title");

			initCanvas();
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
				player.currentTime = -2000;
				//player.startDelay=2000;

				
				player.setAnimation(function(data) {
					draw2(data.now);
				});
				fillTracks();

			});


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
		document.body.addEventListener("mousewheel", myMouseWheel);
		
	
	
	
	
	
	

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
		tr.style.height = height*0.9 + "px";
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
	
	for (let i = 0; i < midiFile.tracks.length;i++) {
		$(trackList).append(createTrackDiv(i));
	}
	if (tracksCollapsed) {
		$(trackList).slideUp();
	}

	tr.appendChild(trB);
	tr.appendChild(trackList);

	//$("body").append(tr);
}
function createTrackDiv(i) {
	let outer = createDiv("outerTrack"+i,"outerTrack")
	
	outer.style.backgroundColor = "rgba("+colors[i][0]+","+colors[i][1]+","+colors[i][2]+","+1+")";
	outer.style.width = width * 0.1 + "px";

	let inner = createDiv("innerTrack"+i,"innerTrack");
	inner.innerHTML = "Hide";
	//inner.style.backgroundColor = "white";
	inner.style.width = width * 0.1 + "px";

	/*let vol = document.createElement("input");
	vol.type = "range";
	vol.min = "0";
	vol.max = 100;
	vol.label = "Volume";
	vol.addEventListener("change",function(val) {
		console.log(vol.value);
	})
	inner.appendChild(vol);*/

	let outerTitle = createDiv("trackTitle"+i,"trackTitle");
	outerTitle.innerHTML = "Track " + i;

	inner.addEventListener("click",function(ev) {

		if (tracks[i].hidden) {
			$(inner).html("Hide");
			tracks[i].hidden = false;
		} else {
			$(inner).html("Show");
			tracks[i].hidden = true;
		}
	}, i)

	outer.appendChild(outerTitle);
	outer.appendChild(inner);
	return outer;
}
function aj(url) {
	$.ajax({
	  url:"file:///Users/benni/GitHub/website/MIDI.js-master/examples/MIDIPlayer.html",
	  type: 'GET',
	  dataType: 'jsonp',
	  success : function(data){
	console.log(data)
	    //data is a variable containing the returned data
	  }
	});

}
var frames = [];
/*var workerPath = 'https://archive.org/download/ffmpeg_asm/ffmpeg_asm.js';
var worker;
function convertStreams(videoBlob) {
    var vab;
    var buffersReady;
    var workerReady;
    var posted = false;

    var fileReader1 = new FileReader();
    fileReader1.onload = function() {
        vab = this.result;

        buffersReady = true;

        if (buffersReady && workerReady && !posted) postMessage();
    };
    
    fileReader1.readAsArrayBuffer(videoBlob);

    if (!worker) {
        worker = processInWebWorker();
    }

    worker.onmessage = function(event) {
        var message = event.data;
        if (message.type == "ready") {
            log('<a href="'+ workerPath +'" download="ffmpeg-asm.js">ffmpeg-asm.js</a> file has been loaded.');
            workerReady = true;
            if (buffersReady)
                postMessage();
        } else if (message.type == "stdout") {
            log(message.data);
        } else if (message.type == "start") {
            log('<a href="'+ workerPath +'" download="ffmpeg-asm.js">ffmpeg-asm.js</a> file received ffmpeg command.');
        } else if (message.type == "done") {
            log(JSON.stringify(message));

            var result = message.data[0];
            log(JSON.stringify(result));

            var blob = new Blob([result.data], {
                type: 'video/mp4'
            });

            log(JSON.stringify(blob));

            PostBlob(blob);
        }
    };
    var postMessage = function() {
        posted = true;
		
		worker.postMessage({
            type: 'command',
            arguments: [
                '-i', 'video.webm',
                '-i', 'audio.wav',
                '-c:v', 'mpeg4',
                '-c:a', 'vorbis', // or aac
                '-b:v', '6400k',  // or 1450k
                '-b:a', '4800k',  // or 96k
                '-strict', 'experimental', 'output.mp4'
            ],
            files: [
                {
                    data: new Uint8Array(vab),
                    name: 'video.webm'
                },
                
            ]
        });
    };
}
function log(message) {
    //h2.innerHTML = message;
    console.log(message);
}
function processInWebWorker() {
    var blob = URL.createObjectURL(new Blob(['importScripts("' + workerPath + '");var now = Date.now;function print(text) {postMessage({"type" : "stdout","data" : text});};onmessage = function(event) {var message = event.data;if (message.type === "command") {var Module = {print: print,printErr: print,files: message.files || [],arguments: message.arguments || [],TOTAL_MEMORY: 268435456};postMessage({"type" : "start","data" : Module.arguments.join(" ")});postMessage({"type" : "stdout","data" : "Received command: " +Module.arguments.join(" ") +((Module.TOTAL_MEMORY) ? ".  Processing with " + Module.TOTAL_MEMORY + " bits." : "")});var time = now();var result = ffmpeg_run(Module);var totalTime = now() - time;postMessage({"type" : "stdout","data" : "Finished processing (took " + totalTime + "ms)"});postMessage({"type" : "done","data" : result,"time" : totalTime});}};postMessage({"type" : "ready"});'], {
        type: 'application/javascript'
    }));

    var worker = new Worker(blob);
    URL.revokeObjectURL(blob);
    return worker;
}
function playAndRecordNoSound() {
	videoTime+=0.05;
	draw2(videoTime);
	//createFrame();
	window.requestAnimationFrame(playAndRecordNoSound);
	//capturer.capture(canvas);
}*/

function createFrame() {
	let frame = document.createElement("canvas");
	frame.width = width;
	frame.height = height;
	let ct = frame.getContext("2d");
	ct.drawImage(canvasLines, 0, 0);
	ct.drawImage(pCanvas, 0, height * 0.9);
	ct.drawImage(canvas, 0, 0);
	ct.drawImage(pCanvas2, 0, height * 0.9);
	ct.drawImage(canvasFg, 0, height * 0.9);
	frames.push(frame.toDataURL('image/webp', 1));

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
	pCtx.fillStyle="black";
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
	pCtx2.fillStyle = "rgba(0,0,0,1)";
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
				ctx.beginPath();

			
				roundRect(ctxFG,keyDims[note.noteNum].x,
					0,
					keyDims[note.noteNum].w,
					keyDims[note.noteNum].h,
				Math.min(keyDims[note.noteNum].h,w)/3);
				ctx.fill();
							
				ctx.closePath();	
			
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

function tick() {
	var now = window.performance.now(); // current time in ms

	var deltaTime = now - lastTick; // amount of time elapsed since last tick

	lastTick = now;


	ticker += deltaTime;

	theLoop = window.requestAnimationFrame(tick);

}

//Create array with one entry for each second in song. with all notes for each second within.
function createNoteArray() {
	allNotes = [];
	console.log(midiFile);
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
		player.currentTime = -2000;
		curInd = 0;
		fillTracks();
	});

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

	player.currentTime = Math.min(player.endTime, Math.max(-2000, player.currentTime + wheel));
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
		let reader2 = new FileReader();
		reader.onload = function(theFile) {
			song.push(reader.result)
			loadSong(song[song.length - 1]);

			//Add loaded file to song[];
		};
		reader2.onload = function(theFile) {
			decode(reader2.result);
			console.log(123);
		}
		// Read in the file as a data URL.
		reader.readAsDataURL(f);
		reader2.readAsArrayBuffer(f);
	}
}



//Array with all loaded songs.
var song = [

	'data:audio/midi;base64,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',
];

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
	console.log(count);
	while (count > 0) {
		count--;
		let obj = bufferToWave(abuffer, offset, block);
		console.log(obj);
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