class Render {
    constructor(player) {
        this.player = player
        this.resize()

        this.keyDimensions = []


        this.setupCanvases()


        window.addEventListener("resize", this.resize.bind(this))

    }
    
    /**
     * Sets all dimensions dependent on window size
     */
    resize() {
        this.width = Math.max(750,Math.floor(window.innerWidth))
        this.height = Math.floor(window.innerHeight)
        this.noteToHeightConst = this.height * 3
        this.whiteKeyWidth = Math.max(24, Math.floor(this.width / 52))
        this.whiteKeyHeight = this.whiteKeyWidth * 4.5
        this.blackKeyWidth = Math.floor(this.whiteKeyWidth * 0.5829787234)
        this.blackKeyHeight = Math.floor(this.whiteKeyHeight * 2 / 3)

        this.keyDimensions = []

        this.setupCanvases()
    }
    /**
     * Main rendering function
     */
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.progressBarCtx.clearRect(0, 0, this.width, this.height)
        this.playedKeysCtxWhite.clearRect(0, 0, this.width, this.whiteKeyHeight)
        this.playedKeysCtxBlack.clearRect(0, 0, this.width, this.whiteKeyHeight)
        let time = this.player.getTime()


        if (!this.player.loading && this.player.getSong()) {
            this.drawProgressBar()
            this.drawTempoLines(time)
            let lookBackTime = Math.floor(time - 4)
            let song = this.player.getSong()
            for (let t in song.activeTracks) {
                let track = song.activeTracks[t];
                for (let i = lookBackTime; i < time + 10; i++) {
                    if (track.notesBySeconds[i]) {
                        track.notesBySeconds[i].slice(0)
                            .filter(note => note.instrument != 'percussion')
                            .forEach(note => this.drawNote(note, time))
                    }
                }
            }
        }
    }
    /**
     * 
     */
    setupCanvases() {
        if (!this.cnvBG) {
            this.cnvBG = DomHelper.createCanvas(this.width, this.height, {
                backgroundColor:'black',
                position: "absolute",
                top: "0px",
                left: "0px"
            })
            document.body.appendChild(this.cnvBG)
            this.ctxBG = this.cnvBG.getContext("2d")
        }
        DomHelper.setCanvasSize(this.cnvBG, this.width, this.height)

        this.drawBackground()

        //Main Canvas to draw notes on
        if (!this.cnv) {
            this.cnv = DomHelper.createCanvas(this.width, this.height, {
                position: "absolute",
                top: "0px",
                left: "0px",
                background: "linear-gradient(0deg, rgba(0,0,0,0.8), transparent)"
            })
            document.body.appendChild(this.cnv)
            this.ctx = this.cnv.getContext("2d")
        }
        DomHelper.setCanvasSize(this.cnv, this.width, this.height)

        if (!this.pianoCanvasWhite) {
            this.pianoCanvasWhite = DomHelper.createCanvas(this.width, this.whiteKeyHeight, {
                position: "absolute",
                left: "0px",
                boxShadow: "0px -3px 5px 5px rgba(0,0,0,0.5)"
            })
            document.body.appendChild(this.pianoCanvasWhite)
            this.pianoCtxWhite = this.pianoCanvasWhite.getContext("2d");
        }
        DomHelper.setCanvasSize(this.pianoCanvasWhite, this.width, this.whiteKeyHeight)
        this.pianoCanvasWhite.style.top = this.height - this.whiteKeyHeight + "px"

        if (!this.playedKeysCanvasWhite) {
            this.playedKeysCanvasWhite = DomHelper.createCanvas(this.width, this.whiteKeyHeight, {
                position: "absolute",
                left: "0px"
            })
            document.body.appendChild(this.playedKeysCanvasWhite)
            this.playedKeysCtxWhite = this.playedKeysCanvasWhite.getContext("2d")
        }
        DomHelper.setCanvasSize(this.playedKeysCanvasWhite, this.width, this.whiteKeyHeight)
        this.playedKeysCanvasWhite.style.top = this.height - this.whiteKeyHeight + "px"

        if (!this.pianoCanvasBlack) {
            this.pianoCanvasBlack = DomHelper.createCanvas(this.width, this.whiteKeyHeight, {
                position: "absolute",
                left: "0px"
            })
            document.body.appendChild(this.pianoCanvasBlack)
            this.pianoCtxBlack = this.pianoCanvasBlack.getContext("2d")
        }
        DomHelper.setCanvasSize(this.pianoCanvasBlack, this.width, this.whiteKeyHeight)
        this.pianoCanvasBlack.style.top = this.height - this.whiteKeyHeight + "px"

        if (!this.playedKeysCanvasBlack) {
            this.playedKeysCanvasBlack = DomHelper.createCanvas(this.width, this.whiteKeyHeight, {
                position: "absolute",
                left: "0px"
            })
            document.body.appendChild(this.playedKeysCanvasBlack)
            this.playedKeysCtxBlack = this.playedKeysCanvasBlack.getContext("2d")
        }
        DomHelper.setCanvasSize(this.playedKeysCanvasBlack, this.width, this.whiteKeyHeight)
        this.playedKeysCanvasBlack.style.top = this.height - this.whiteKeyHeight + "px"

        this.drawPiano(this.pianoCtxWhite, this.pianoCtxBlack);

        if (!this.progressBarCanvas) {
            this.progressBarCanvas = DomHelper.createCanvas(20, this.height - this.whiteKeyHeight, {
                position: "absolute",
                right: "0px",
                top: "0px"
            })
            document.body.appendChild(this.progressBarCanvas)
            this.progressBarCtx = this.progressBarCanvas.getContext("2d")
        }
        DomHelper.setCanvasSize(this.progressBarCanvas, 20, this.height - this.whiteKeyHeight)
    }
    drawProgressBar() {
        let ctx = this.progressBarCtx
        let progressPercent = this.player.getTime() / (this.player.getSong().getEnd() / 1000)
        ctx.fillStyle = "black"
        let ht = this.height - this.whiteKeyHeight
        ctx.fillRect(0, ht - ht * progressPercent, 20, 20)
    }

    /**
     * 
     */
    drawBackground() {
        let c = this.ctxBG
        c.strokeStyle = "rgba(255,255,255,0.6)"
        c.fillStyle = "rgba(255,255,255,0.1)"
        for (let i = 0; i < 88; i++) {
            if (!this.isBlack(i)) {
                c.strokeStyle = i % 2 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)"
                c.lineWidth = i % 12 ? 1 : 3
                //c.globalAlpha = 0.25  + (i+9)%3 / 4  + (i + 9) % 12 / 48
                let dim = this.getKeyDimensions(i)
                c.fillRect(dim.x, dim.y, dim.w, this.height)
                c.strokeRect(dim.x, dim.y, dim.w, this.height)
            }
        }
    }
    /**
     * 
     * @param {NoteEvent} note 
     */
    drawActiveKey(note) {
        let dim = this.getKeyDimensions(note.noteNumber - 21)
        let keyBlack = this.isBlack(note.noteNumber - 21)
        let ctx = keyBlack ?
            this.playedKeysCtxBlack : this.playedKeysCtxWhite
        let color = keyBlack ? this.getColor(note.track).black : this.getColor(note.track).white
        ctx.fillStyle = color
        if (keyBlack) {
            ctx.globalAlpha = 0.5;
            ctx.fillRect(dim.x + 1, dim.y, dim.w - 2, dim.h)
            ctx.globalAlpha = 1;
        } else {
            ctx.save()
            ctx.beginPath()
            ctx.rect(dim.x + 1, dim.y, dim.w - 2, dim.h)
            ctx.clip()
            let lgr = ctx.createLinearGradient(dim.x, dim.y + dim.h / 2, dim.x + dim.w, dim.y + dim.h / 2)
            lgr.addColorStop(0, "rgba(0,0,0,0.7)")
            lgr.addColorStop(0.4, "rgba(0,0,0,0)")
            lgr.addColorStop(0.6, "rgba(0,0,0,0)")
            lgr.addColorStop(1, "rgba(0,0,0,0.7)")
            ctx.fillStyle = lgr
            ctx.fillRect(dim.x + 1, dim.y, dim.w - 2, dim.h)
            ctx.fillStyle = color
            ctx.fillRect(dim.x + 1, dim.y, dim.w - 2, dim.h)
            ctx.closePath()
            ctx.restore()
        }
    }
    /**
     * 
     * @param {NoteEvent} note 
     * @param {Number} time 
     */
    drawNote(note, time) {
        if (!this.player.tracks[note.track].draw) return

        let ctx = this.ctx
        let currentTime = time * 1000
        let keyBlack = this.isBlack(note.noteNumber - 21)
        let noteDims = this.getNoteDimensions(note.noteNumber, currentTime, note.timestamp, note.offTime)

        let isOn = note.timestamp < currentTime && note.offTime > currentTime ? 1 : 0;
        let noteDoneRatio = 1 - (note.offTime - currentTime) / (note.duration)
        noteDoneRatio *= isOn
        let rad = noteDims.w / 10 * (1 -  noteDoneRatio)
        let x = noteDims.x + rad + 1
        let y = noteDims.y
        let w = noteDims.w - rad * 2 - 2
        let h = noteDims.h

        if (isOn) {

            ctx.fillStyle = keyBlack ? this.getColor(note.track).black : this.getColor(note.track).white
            ctx.globalAlpha = Math.max(0, 0.6 - noteDoneRatio)
            let wOffset = Math.pow(this.whiteKeyWidth / 2, 1 + noteDoneRatio)
            this.drawRoundRect(ctx, x - wOffset / 2, y, w + wOffset, h, rad + rad * noteDoneRatio * 4)
            ctx.fill();
            ctx.globalAlpha = 1

            this.drawActiveKey(note)
            ctx.strokeStyle = "rgba(255,255,255,0.5)"
            ctx.lineWidth = 1.5;
        } else {
            ctx.strokeStyle = "rgba(0,0,0,1)"
            ctx.lineWidth = 1;
        }
        ctx.fillStyle = keyBlack ? this.getColor(note.track).black : this.getColor(note.track).white

        // if (isOn) {
        //     this.drawRoundRect(ctx, x, y, w, h, rad)
        //     ctx.fill();
        //     ctx.stroke();
        // }

        this.drawRoundRect(ctx, x, y, w, h, rad)
        ctx.fill();
        let lgr = ctx.createLinearGradient(x,y,x+w,y+h)
        lgr.addColorStop(0,"rgba(0,0,0,0.2)")
        lgr.addColorStop(1,"rgba(255,255,255,0)")
        ctx.fillStyle = lgr
        ctx.fill()
        lgr = ctx.createLinearGradient(x+w,y+h,x,y)
        lgr.addColorStop(0,"rgba(0,0,0,0)")
        lgr.addColorStop(1,"rgba(255,255,255,0.2)")
        ctx.fillStyle = lgr
        ctx.fill()

        lgr = ctx.createLinearGradient(x+6,y+12,x,y)
        lgr.addColorStop(0,"rgba(0,0,0,0)")
        lgr.addColorStop(1,"rgba(255,255,255,0.95)")
        ctx.fillStyle = lgr
        ctx.fill()

        // lgr = ctx.createLinearGradient(x,y,x+this.blackKeyWidth,y+this.blackKeyWidth)
        // lgr.addColorStop(0.7,"rgba(0,0,0,0)")
        // lgr.addColorStop(0.95,"rgba(255,255,255,0.55)")
        // lgr.addColorStop(1,"rgba(255,255,255,0.95)")
        // ctx.fillStyle = lgr
        // ctx.fill()

        
        ctx.stroke();
    }
    /**
     * 
     * @param {Number} currentTime 
     */
    drawTempoLines(currentTime) {
        let tempoLines = this.player.getSong().getTempoLines()
        let ctx = this.ctx
        let height = this.height - this.whiteKeyHeight


        ctx.strokeStyle = "rgba(255,255,255,0.05)"

        ctx.lineWidth = 1
        let currentSecond = Math.floor(currentTime)
        for (let i = currentSecond; i < currentSecond + 6; i++) {
            if (!tempoLines[i]) {
                continue
            }
            tempoLines[i].forEach(tempoLine => {
                let ht = height - (tempoLine - currentTime * 1000) / this.noteToHeightConst * height
                ctx.beginPath();
                ctx.moveTo(0, ht);
                ctx.lineTo(this.width, ht);
                ctx.closePath();
                ctx.stroke();
            })
        }
    }
    /**
     * 
     * @param {Number} trackIndex
     */
    getColor(trackIndex) {
        return this.player.tracks[trackIndex].color
    }
    /**
     * Assigns a color to each track of current song. Has to be called once each time a new song is loaded.
     * #Moved to Player.js
     */
    // setupTracks() {
    //     this.tracks = {}
    //     let song = this.player.getSong()
    //     for (let t in song.activeTracks) {
    //         if (!this.tracks.hasOwnProperty(t)) {
    //             this.tracks[t] = {draw:true}
    //         }
    //         this.tracks[t].color = this.colors[t % 4]
    //     }
    // }
    /**
     * 
     * @param {Number} noteNumber 
     */
    getKeyDimensions(noteNumber) {
        if (!this.keyDimensions.hasOwnProperty(noteNumber)) {
            let isBlack = this.isBlack(noteNumber)
            let x = this.getKeyX(noteNumber, isBlack)

            return {
                x: x,
                y: 0,
                w: isBlack ? this.blackKeyWidth : this.whiteKeyWidth,
                h: isBlack ? this.blackKeyHeight : this.whiteKeyHeight,
                black: isBlack,
            }
        }
        return this.keyDimensions[noteNumber]
    }
    /**
     * 
     * @param {Number} noteNumber 
     * @param {Boolean} isBlack 
     */
    getKeyX(noteNumber, isBlack) {
        return (noteNumber -
            Math.floor(Math.max(0, (noteNumber + 11)) / 12) -
            Math.floor(Math.max(0, (noteNumber + 8)) / 12) -
            Math.floor(Math.max(0, (noteNumber + 6)) / 12) -
            Math.floor(Math.max(0, (noteNumber + 3)) / 12) -
            Math.floor(Math.max(0, (noteNumber + 1)) / 12)
        ) * this.whiteKeyWidth + (this.whiteKeyWidth - this.blackKeyWidth / 2) * isBlack
    }
    /**
     * 
     * @param {Number} noteNumber 
     * @param {Number} currentTime 
     * @param {Number} noteStartTime 
     * @param {Number} noteEndTime 
     */
    getNoteDimensions(noteNumber, currentTime, noteStartTime, noteEndTime) {
        noteNumber -= 21;
        const height = this.height - this.whiteKeyHeight

        const dur = noteEndTime - noteStartTime;
        const isBlack = this.isBlack(noteNumber)
        const x = this.getKeyX(noteNumber, isBlack)

        const h = dur / this.noteToHeightConst * (this.height - this.whiteKeyHeight)
        const y = (height) - (noteEndTime - currentTime) / this.noteToHeightConst * (this.height - this.whiteKeyHeight);
        return {
            x: x,
            y: y - 2,
            w: isBlack ? this.blackKeyWidth : this.whiteKeyWidth,
            h: h - 2,
            black: isBlack,
        }

    }
    /**
     * 
     * @param {Number} noteNumber 
     */
    isBlack(noteNumber) {
        return (
            ((noteNumber + 11) % 12 == 0) ||
            ((noteNumber + 8) % 12 == 0) ||
            ((noteNumber + 6) % 12 == 0) ||
            ((noteNumber + 3) % 12 == 0) ||
            ((noteNumber + 1) % 12 == 0)
        ) ? 1 : 0
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} radius 
     */
    drawRoundRect(ctx, x, y, width, height, radius) {
        // radius = radius * 2 < ( Math.min( height, width ) ) ? radius : ( Math.min( height, width ) ) / 2
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

        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.lineTo(x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.lineTo(x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.lineTo(x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.lineTo(x + radius.tl, y);


        ctx.closePath();

    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctxWhite 
     * @param {CanvasRenderingContext2D} ctxBlack 
     */
    drawPiano(ctxWhite, ctxBlack) {
        //Background
        ctxWhite.fillStyle = "rgba(0,0,0,1)";
        ctxWhite.fillRect(0, 5, this.width, this.height * 0.1);

        this.drawWhiteKeys(ctxWhite)
        this.drawBlackKeys(ctxBlack)

        //velvet
        ctxWhite.strokeStyle = "rgba(155,50,50,1)";
        ctxWhite.shadowColor = "rgba(155,50,50,1)";
        ctxWhite.shadowOffsetY = 1;
        ctxWhite.shadowBlur = 4
        ctxWhite.lineWidth = 4;
        ctxWhite.beginPath();
        ctxWhite.moveTo(52 * this.whiteKeyWidth, 2)
        ctxWhite.lineTo(0, 2)
        ctxWhite.closePath()
        ctxWhite.stroke()
    }
    drawWhiteKeys(ctxWhite) {
        for (let i = 0; i < 88; i++) {
            let dims = this.getKeyDimensions(i);
            if (!this.isBlack(i)) {
                this.drawWhiteKey(ctxWhite, dims);
            }
        }
    }

    drawBlackKeys(ctxBlack) {
        let rgr2 = ctxBlack.createLinearGradient(this.width / 2, -this.height * 0.05, this.width / 2, this.height * 0.1);
        rgr2.addColorStop(1, "rgba(30,30,30,1)");
        rgr2.addColorStop(0, "black");
        ctxBlack.fillStyle = rgr2;
        for (let i = 0; i < 88; i++) {
            let dims = this.getKeyDimensions(i);
            if (this.isBlack(i)) {
                this.drawBlackKey(ctxBlack, dims)
            }
        }
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Dimensions} dims 
     */
    drawWhiteKey(ctx, dims) {
        let radius = 4
        let x = dims.x
        let y = dims.y - 2
        let height = dims.h
        let width = dims.w

        ctx.beginPath();
        ctx.moveTo(x + 1, y);
        ctx.lineTo(x - 1 + width, y);
        ctx.lineTo(x - 1 + width, y + height - radius);
        ctx.lineTo(x - 1 + width - radius, y + height);
        ctx.lineTo(x + 1 + radius, y + height);
        ctx.lineTo(x + 1, y + height - radius);
        ctx.lineTo(x + 1, y);

        ctx.fillStyle = "white";
        ctx.fill();

        let rgr = ctx.createLinearGradient(x, this.whiteKeyHeight / 2, x + width, this.whiteKeyHeight / 2);
        rgr.addColorStop(0.9, "rgba(0,0,0,0.1)");
        rgr.addColorStop(0.5, "rgba(0,0,0,0)");
        rgr.addColorStop(0.1, "rgba(0,0,0,0.1)");
        ctx.fillStyle = rgr;
        ctx.fill();

        let rgr2 = ctx.createLinearGradient(this.width / 2, 0, this.width / 2, this.whiteKeyHeight);
        rgr2.addColorStop(1, "rgba(255,255,255,0.5)");
        rgr2.addColorStop(0, "rgba(0,0,0,0.6)");
        ctx.fillStyle = rgr2;
        ctx.fill();

        ctx.closePath();
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Dimensions} dims 
     */
    drawBlackKey(ctx, dims) {
        let radius = 2
        let x = dims.x
        let y = dims.y + 1.5
        let height = dims.h
        let width = dims.w

        ctx.beginPath();
        ctx.moveTo(x + 1, y);
        ctx.lineTo(x - 1 + width, y);
        ctx.lineTo(x - 1 + width, y + height - radius);
        ctx.lineTo(x - 1 + width - radius, y + height);
        ctx.lineTo(x + 1 + radius, y + height);
        ctx.lineTo(x + 1, y + height - radius);
        ctx.lineTo(x + 1, y);

        ctx.fillStyle = "black";
        ctx.fill();

        let rgr = ctx.createLinearGradient(x, this.whiteKeyHeight / 2, x + width, this.whiteKeyHeight / 2);
        rgr.addColorStop(0.9, "rgba(0,0,0,0.3)");
        rgr.addColorStop(0.5, "rgba(0,0,0,0)");
        rgr.addColorStop(0.1, "rgba(0,0,0,0.3)");
        ctx.fillStyle = rgr;
        ctx.fill();


        let rgr2 = ctx.createLinearGradient(this.width / 2, 0, this.width / 2, this.whiteKeyHeight);
        rgr2.addColorStop(1, "rgba(0,0,0,0.5)");
        rgr2.addColorStop(0, "rgba(0,0,0,0.6)");
        ctx.fillStyle = rgr2;
        ctx.fill();

        ctx.closePath();
    }

}
