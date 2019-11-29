class Render {
    constructor(player) {
        this.player = player
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.whiteKeyWidth = Math.floor(this.width / 52)
        this.whiteKeyHeight = 100
        this.blackKeyWidth = this.whiteKeyWidth / 2
        this.blackKeyHeight = 80
        this.noteToHeightConst = 4000
        this.colors = ["Red", "Green", {white:"rgb(40,50,90)",black:"Blue"}, { white:"rgb(50,90,60)",black:"rgb(20,85,40)"}]
        this.keyDimensions = []
        


        this.setupCanvases()

    }
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.playedKeysCtxWhite.clearRect(0, 0, this.width, this.whiteKeyHeight)
        this.playedKeysCtxBlack.clearRect(0, 0, this.width, this.whiteKeyHeight)
        let time = this.player.getTime()
        this.drawTempoLines(time)
        if (this.player.getSong()) {
            let lookBackTime = Math.floor(time - 4)
            let song = this.player.getSong()
            for (let t in song.activeTracks) {
                let track = song.activeTracks[t];
                for (let i = lookBackTime; i < time + 10; i++) {
                    if (track.notesBySeconds[i]) {
                        track.notesBySeconds[i].forEach(note => this.drawNote(note, time))
                    }
                }
            }
        }
    }
    setupCanvases() {
        this.cnvBG = this.createCanvas(this.width, this.height)
        this.cnvBG.style.top = "0px"
        this.cnvBG.style.left = "0px"
        document.body.appendChild(this.cnvBG)
        this.ctxBG = this.cnvBG.getContext("2d")

        this.drawBackground()

        this.cnv = this.createCanvas(this.width, this.height)
        this.cnv.style.top = "0px"
        this.cnv.style.left = "0px"
        document.body.appendChild(this.cnv)
        this.ctx = this.cnv.getContext("2d")
        this.ctx.fillStyle = "black"

        let pianoCanvasWhite = this.createCanvas(this.width, this.whiteKeyHeight)
        document.body.appendChild(pianoCanvasWhite)
        pianoCanvasWhite.style.top = this.height - this.whiteKeyHeight + "px"
        pianoCanvasWhite.style.left = "0px"

        let playedKeysCanvasWhite = this.createCanvas(this.width, this.whiteKeyHeight)
        document.body.appendChild(playedKeysCanvasWhite)
        playedKeysCanvasWhite.style.top = this.height - this.whiteKeyHeight + "px"
        playedKeysCanvasWhite.style.left = "0px"
        this.playedKeysCtxWhite = playedKeysCanvasWhite.getContext("2d")

        let pianoCanvasBlack = this.createCanvas(this.width, this.whiteKeyHeight)
        document.body.appendChild(pianoCanvasBlack)
        pianoCanvasBlack.style.top = this.height - this.whiteKeyHeight + "px"
        pianoCanvasBlack.style.left = "0px"

        let playedKeysCanvasBlack = this.createCanvas(this.width, this.whiteKeyHeight)
        document.body.appendChild(playedKeysCanvasBlack)
        playedKeysCanvasBlack.style.top = this.height - this.whiteKeyHeight + "px"
        playedKeysCanvasBlack.style.left = "0px"
        this.playedKeysCtxBlack = playedKeysCanvasBlack.getContext("2d")

        this.drawPiano(pianoCanvasWhite.getContext("2d"),
            pianoCanvasBlack.getContext("2d"));
    }
    drawBackground() {
        let c = this.ctxBG
        c.fillStyle = "rgba(255,255,255,0.3)"
        c.fillStyle = "rgba(255,255,255,0.3)"
        for (let i = 0; i < 88; i++) {
            if (!this.isBlack(i)) {
                let dim = this.getKeyDimensions(i)
                c.fillRect(dim.x, dim.y, dim.w, this.height)
                c.strokeRect(dim.x, dim.y, dim.w, this.height)
            }
        }
    }
    drawActiveKey(note) {
        let dim = this.getKeyDimensions(note.noteNumber - 21)
        let keyBlack = this.isBlack(note.noteNumber - 21)
        let ctx = keyBlack ?
            this.playedKeysCtxBlack : this.playedKeysCtxWhite
        let color = keyBlack ? this.getColor(note.track).black : this.getColor(note.track).white
        ctx.fillStyle = color
        ctx.globalAlpha = 0.5;
        ctx.fillRect(dim.x + 1, dim.y, dim.w - 2, dim.h)
        ctx.globalAlpha = 1;
    }
    drawNote(note, time) {
        let currentTime = time * 1000
        let keyBlack = this.isBlack(note.noteNumber - 21)
        let noteDims = this.getNoteDimensions(note.noteNumber, currentTime, note.timestamp, note.offTime)
        if (note.timestamp < currentTime &&
            note.offTime > currentTime) {
            this.drawActiveKey(note)
            this.ctx.strokeStyle = "rgba(255,255,255,0.5)"
            this.ctx.lineWidth = 1.5;
        } else {
            this.ctx.strokeStyle = "rgba(0,0,0,1)"
            this.ctx.lineWidth = 0.5;
        }
        this.ctx.fillStyle = keyBlack ? this.getColor(note.track).black : this.getColor(note.track).white
        let isOn = note.timestamp < currentTime && note.offTime > currentTime ? 1 : 0;
        let noteDoneRatio = 1 - (note.offTime - currentTime) / (note.duration)
        noteDoneRatio *= isOn
        let rad = noteDims.w / 5 * noteDoneRatio
        let x =  noteDims.x + rad + 1
        let y = noteDims.y + rad  + 1
        let w =noteDims.w - rad * 2 - 2
        let h = noteDims.h - rad * 2 - 2
        this.drawRoundRect(this.ctx,x, y + 5, w, h, 4 + rad * 0.5)
        this.ctx.fill();
        this.ctx.stroke();
    }
    drawTempoLines(currentTime) {
        let ctx = this.ctx
        let ticksPerBeat = 423042 / 1000
        let bpm = 62
        let beatDuration = ticksPerBeat * bpm / 60 / 1000
        let rest = -(currentTime % beatDuration);

        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 0.5;
        let height = this.height - this.whiteKeyHeight
        ctx.beginPath();
        for (let i = 0; i < 14; i++) {
            ctx.moveTo(0, height - rest / (this.noteToHeightConst / 1000) * height - i * beatDuration / 5 * height);
            ctx.lineTo(this.width, height - rest / (this.noteToHeightConst / 1000) * height - i * beatDuration / 5 * height);
        }
        ctx.stroke();
        ctx.closePath();
    }
    getColor(track) {
        if (!this.trackColors) {
            this.setTrackColors()
        }
        return this.trackColors[track] 
    }
    setTrackColors() {
        this.trackColors = {}
        let song = this.player.getSong()
        for (let t in song.activeTracks) {
            this.trackColors[t] = this.colors.pop()
        }
    }

    createCanvas(width, height) {
        let cnv = document.createElement("canvas")
        cnv.width = Math.max(width,640);
        cnv.height = height; //TODO Set minimum height/width
        cnv.style.position = "absolute"
        return cnv
    }
    getNoteHeightDim(currentTime, start, end) {
        let y = height * 0.9 - (end - currentTime) / (this.noteToHeightConst) * height;
        return {
            y: y + 0.5,
            h: (end - start) / (5000) * height - 1,
        }

    }

    getKeyDimensions(noteNumber) {
        if (!this.keyDimensions.hasOwnProperty(noteNumber)) {
            let blackKey = this.isBlack(noteNumber)
            //for xPos only the amount of white keys matter since the black are placed on top.
            let x = (noteNumber -
                Math.floor(Math.max(0, (noteNumber + 11)) / 12) -
                Math.floor(Math.max(0, (noteNumber + 8)) / 12) -
                Math.floor(Math.max(0, (noteNumber + 6)) / 12) -
                Math.floor(Math.max(0, (noteNumber + 3)) / 12) -
                Math.floor(Math.max(0, (noteNumber + 1)) / 12)
            ) * this.whiteKeyWidth + (this.whiteKeyWidth - this.blackKeyWidth / 2) * blackKey;

            return {
                x: x,
                y: 0,
                w: this.whiteKeyWidth * (1 - blackKey) + (blackKey * this.blackKeyWidth),
                h: (1 - blackKey) * this.whiteKeyHeight + blackKey * this.blackKeyHeight,
                noteX: x + 2,
                noteW: this.whiteKeyWidth * (1 - blackKey) + (blackKey * this.blackKeyWidth) - 4,
                black: blackKey,
            }
        }

        return this.keyDimensions[noteNumber]


    }
    getNoteDimensions(noteNumber, currentTime, start, end) {
        noteNumber -= 21;
        let dur = end - start;
        let blackKey = this.isBlack(noteNumber)
        //for xPos only the amount of white keys matter since the black are placed on top.
        let x = (noteNumber -
            Math.floor(Math.max(0, (noteNumber + 11)) / 12) -
            Math.floor(Math.max(0, (noteNumber + 8)) / 12) -
            Math.floor(Math.max(0, (noteNumber + 6)) / 12) -
            Math.floor(Math.max(0, (noteNumber + 3)) / 12) -
            Math.floor(Math.max(0, (noteNumber + 1)) / 12)
        ) * this.whiteKeyWidth + (this.whiteKeyWidth - this.blackKeyWidth / 2) * blackKey;

        let h = dur / this.noteToHeightConst * (this.height - this.whiteKeyHeight)
        let y = (this.height - this.whiteKeyHeight) - (end - currentTime) / this.noteToHeightConst * (this.height - this.whiteKeyHeight);
        return {
            x: x,
            y: y,
            w: this.whiteKeyWidth * (1 - blackKey) + (blackKey * this.blackKeyWidth),
            h: h,
            black: blackKey,
        }

    }
    isBlack(noteNumber) {
        return (
            ((noteNumber + 11) % 12 == 0) ||
            ((noteNumber + 8) % 12 == 0) ||
            ((noteNumber + 6) % 12 == 0) ||
            ((noteNumber + 3) % 12 == 0) ||
            ((noteNumber + 1) % 12 == 0)
        ) ? 1 : 0
    }
    drawRoundRect(ctx, x, y, width, height, radius) {
        radius = radius * 2 < (Math.min(height,width)) ? radius : (Math.min(height,width)) / 2
        if (typeof radius === 'undefined') {
            radius = 0;
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

/* 
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y); */

        
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.lineTo( x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.lineTo( x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.lineTo( x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.lineTo(x + radius.tl, y);


        ctx.closePath();

    }
    drawPiano(ctxWhite, ctxBlack) {

        //Background
        ctxWhite.fillStyle = "rgba(0,0,0,1)";
        ctxWhite.fillRect(0, 5, this.width, this.height * 0.1);
        ctxWhite.fillStyle = "rgba(255,255,255,0.5)";
        ctxWhite.fillRect(0, 5, this.width, this.height);

        //white keys
        let rgr = ctxWhite.createLinearGradient(this.width / 2, -this.height * 0.05, this.width / 2, this.height * 0.1);
        rgr.addColorStop(1, "white");
        rgr.addColorStop(0, "black");
        ctxWhite.fillStyle = rgr;
        for (let i = 0; i < 88; i++) {
            let dims = this.getKeyDimensions(i);
            if (!this.isBlack(i)) {
                
                this.drawWhiteKey(ctxWhite,dims)
            }
        }

        //black keys
        let rgr2 = ctxWhite.createLinearGradient(this.width / 2, -this.height * 0.05, this.width / 2, this.height * 0.1);
        rgr2.addColorStop(1, "rgba(30,30,30,1)");
        rgr2.addColorStop(0, "black");
        ctxBlack.fillStyle = rgr2;
        for (let i = 0; i < 88; i++) {
            let dims = this.getKeyDimensions(i);
            if (this.isBlack(i)) {
               this.drawBlackKey(ctxBlack,dims)
            }
        }

        //velvet
        ctxWhite.strokeStyle = "rgba(255,150,150,0.5)";
        ctxWhite.lineWidth = 6;
        ctxWhite.beginPath();
        ctxWhite.moveTo(this.width,3)
        ctxWhite.lineTo(0,3)
        ctxWhite.closePath()
        ctxWhite.stroke()
    }
    drawWhiteKey(ctx,dims) {
        this.drawRoundRect(ctx, dims.x, dims.y, dims.w, dims.h, 1);
        ctx.fill();
    }
    drawBlackKey(ctx,dims) {
        this.drawRoundRect(ctx, dims.x, dims.y, dims.w, dims.h, 2);
        ctx.fill();
    }

}
