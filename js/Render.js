class Render {
    constructor( player ) {
        this.player = player
        this.resize()
        this.noteToHeightConst = 4000
        this.colors = [ { white: "rgb(40,50,90)", black: "Blue" }, { white: "rgb(50,90,60)", black: "rgb(20,85,40)" }, { white: "rgb(40,50,90)", black: "Blue" }, { white: "rgb(50,90,60)", black: "rgb(20,85,40)" } ]
        this.keyDimensions = []



        this.setupCanvases()

        window.addEventListener("resize", this.resize.bind(this))

    }
    resize() {
        this.width = Math.floor(window.innerWidth)
        this.height = Math.floor(window.innerHeight)
        this.whiteKeyWidth = Math.max(12,Math.floor( this.width / 52 ))
        this.whiteKeyHeight = this.whiteKeyWidth * 4.5
        this.blackKeyWidth = Math.floor(this.whiteKeyWidth  * 0.5829787234)
        this.blackKeyHeight = Math.floor(this.whiteKeyHeight * 2 / 3)

        this.keyDimensions = []

        this.setupCanvases()
    }
    render() {
        this.ctx.clearRect( 0, 0, this.width, this.height )
        this.playedKeysCtxWhite.clearRect( 0, 0, this.width, this.whiteKeyHeight )
        this.playedKeysCtxBlack.clearRect( 0, 0, this.width, this.whiteKeyHeight )
        let time = this.player.getTime()
        
        if ( this.player.getSong() ) {
            this.drawTempoLines( time )
            let lookBackTime = Math.floor( time - 4 )
            let song = this.player.getSong()
            for ( let t in song.activeTracks ) {
                let track = song.activeTracks[ t ];
                for ( let i = lookBackTime; i < time + 10; i++ ) {
                    if ( track.notesBySeconds[ i ] ) {
                        track.notesBySeconds[ i ].forEach( note => this.drawNote( note, time ) )
                    }
                }
            }
        }
    }
    setupCanvases() {
        if (!this.cnvBG) {
            this.cnvBG = this.createCanvas( this.width, this.height )
            this.cnvBG.style.top = "0px"
            this.cnvBG.style.left = "0px"
            document.body.appendChild( this.cnvBG )
            this.ctxBG = this.cnvBG.getContext( "2d" )
        }
        this.setCanvasSize(this.cnvBG, this.width, this.height)

        this.drawBackground()
        
        if (!this.cnv) {
            this.cnv = this.createCanvas( this.width, this.height )
            this.cnv.style.top = "0px"
            this.cnv.style.left = "0px"
            this.cnv.style.background  ="linear-gradient(0deg, rgba(0,0,0,0.8), transparent)";
            document.body.appendChild( this.cnv )
            this.ctx = this.cnv.getContext( "2d" )
            this.ctx.fillStyle = "black"
        }
        this.setCanvasSize(this.cnv,this.width,this.height)

        if (!this.pianoCanvasWhite) {
            this.pianoCanvasWhite = this.createCanvas( this.width, this.whiteKeyHeight )
            document.body.appendChild( this.pianoCanvasWhite )
            this.pianoCanvasWhite.style.left = "0px"
            this.pianoCanvasWhite.style.boxShadow = "0px -3px 5px 5px rgba(0,0,0,0.5)"
            this.pianoCtxWhite = this.pianoCanvasWhite.getContext("2d");
        }
        this.setCanvasSize(this.pianoCanvasWhite, this.width, this.whiteKeyHeight)
        this.pianoCanvasWhite.style.top = this.height - this.whiteKeyHeight + "px"

        if (!this.playedKeysCanvasWhite) {
            this.playedKeysCanvasWhite = this.createCanvas( this.width, this.whiteKeyHeight )
            document.body.appendChild( this.playedKeysCanvasWhite )
            this.playedKeysCanvasWhite.style.left = "0px"
            this.playedKeysCtxWhite = this.playedKeysCanvasWhite.getContext( "2d" )
        } 
        this.setCanvasSize(this.playedKeysCanvasWhite , this.width, this.whiteKeyHeight)
        this.playedKeysCanvasWhite.style.top = this.height - this.whiteKeyHeight + "px"

        if (!this.pianoCanvasBlack) {
            this.pianoCanvasBlack = this.createCanvas( this.width, this.whiteKeyHeight )
            document.body.appendChild( this.pianoCanvasBlack )
            this.pianoCanvasBlack.style.left = "0px"
            this.pianoCtxBlack =  this.pianoCanvasBlack.getContext("2d")
        }
        this.setCanvasSize(this.pianoCanvasBlack, this.width, this.whiteKeyHeight)
        this.pianoCanvasBlack.style.top = this.height - this.whiteKeyHeight + "px"

        if (!this.playedKeysCanvasBlack) {
            this.playedKeysCanvasBlack = this.createCanvas( this.width, this.whiteKeyHeight )
            document.body.appendChild( this.playedKeysCanvasBlack )
            this.playedKeysCanvasBlack.style.left = "0px"
            this.playedKeysCtxBlack = this.playedKeysCanvasBlack.getContext( "2d" )
        }
        this.setCanvasSize(this.playedKeysCanvasBlack, this.width, this.whiteKeyHeight)
        this.playedKeysCanvasBlack.style.top = this.height - this.whiteKeyHeight + "px"

        this.drawPiano( this.pianoCtxWhite, this.pianoCtxBlack );
    }
    setCanvasSize(cnv,width,height) {
        cnv.width = width
        cnv.height = height
    }

    drawBackground() {
        let c = this.ctxBG
        c.fillStyle = "rgba(255,255,255,0.3)"
        c.fillStyle = "rgba(255,255,255,0.3)"
        for ( let i = 0; i < 88; i++ ) {
            if ( !this.isBlack( i ) ) {
                let dim = this.getKeyDimensions( i )
                c.fillRect( dim.x, dim.y, dim.w, this.height )
                c.strokeRect( dim.x, dim.y, dim.w, this.height )
            }
        }
    }
    drawActiveKey( note ) {
        let dim = this.getKeyDimensions( note.noteNumber - 21 )
        let keyBlack = this.isBlack( note.noteNumber - 21 )
        let ctx = keyBlack ?
            this.playedKeysCtxBlack : this.playedKeysCtxWhite
        let color = keyBlack ? this.getColor( note.track ).black : this.getColor( note.track ).white
        ctx.fillStyle = color
        ctx.globalAlpha = 0.5;
        ctx.fillRect( dim.x + 1, dim.y, dim.w - 2, dim.h )
        ctx.globalAlpha = 1;
    }
    drawNote( note, time ) {
        let currentTime = time * 1000
        let keyBlack = this.isBlack( note.noteNumber - 21 )
        let noteDims = this.getNoteDimensions( note.noteNumber, currentTime, note.timestamp, note.offTime )
        if ( note.timestamp < currentTime &&
            note.offTime > currentTime ) {
            this.drawActiveKey( note )
            this.ctx.strokeStyle = "rgba(255,255,255,0.5)"
            this.ctx.lineWidth = 1.5;
        } else {
            this.ctx.strokeStyle = "rgba(0,0,0,1)"
            this.ctx.lineWidth = 0.5;
        }
        this.ctx.fillStyle = keyBlack ? this.getColor( note.track ).black : this.getColor( note.track ).white
        let isOn = note.timestamp < currentTime && note.offTime > currentTime ? 1 : 0;
        let noteDoneRatio = 1 - ( note.offTime - currentTime ) / ( note.duration )
        noteDoneRatio *= isOn
        let rad = noteDims.w / 5 * noteDoneRatio
        let x = noteDims.x + rad + 1
        let y = noteDims.y  
        let w = noteDims.w - rad * 2 - 2
        let h = noteDims.h 
        this.ctx.fillRect(x,y,w,h)
        //  this.drawRoundRect( this.ctx, x, y + 5, w, h, 4 + rad * 0.5 )
        this.ctx.fill();
        this.ctx.stroke();
    }
    drawTempoLines( currentTime ) {
        let ctx = this.ctx
        let bpm = this.player.getSong().bpm
        let beatDuration = bpm / 60
        let rest = -( currentTime % beatDuration )
        let height = this.height - this.whiteKeyHeight
        let secondHeight = 1000 / this.noteToHeightConst  * height 

        ctx.strokeStyle = "rgba(255,255,255,0.25)"
        ctx.lineWidth = 1
        
        ctx.beginPath();
        for ( let i = 0; i < 7; i++ ) {
            let ht =  height - rest * secondHeight - i * beatDuration * secondHeight
            ctx.moveTo( 0,ht );
            ctx.lineTo( this.width, ht);
        }
        ctx.closePath();
        ctx.stroke();
    }
    getColor( track ) {
        if ( !this.trackColors ) {
            this.setTrackColors()
        }
        return this.trackColors[ track ]
    }
    setTrackColors() {
        this.trackColors = {}
        let song = this.player.getSong()
        for ( let t in song.activeTracks ) {
            this.trackColors[ t ] = this.colors.pop()
        }
    }

    createCanvas( width, height ) {
        let cnv = document.createElement( "canvas" )
        cnv.width = Math.max( width, 640 );
        cnv.height = height; 
        cnv.style.position = "absolute"
        return cnv
    }
    getNoteHeightDim( currentTime, start, end ) {
        let y = height * 0.9 - ( end - currentTime ) / ( this.noteToHeightConst ) * height;
        return {
            y: y + 0.5,
            h: ( end - start ) / ( 5000 ) * height - 1,
        }

    }

    getKeyDimensions( noteNumber ) {
        if ( !this.keyDimensions.hasOwnProperty( noteNumber ) ) {
            let isBlack = this.isBlack( noteNumber )
            let x = this.getKeyX(noteNumber, isBlack)
            
            return {
                x: x,
                y: 0,
                w: isBlack ? this.blackKeyWidth : this.whiteKeyWidth,
                h: isBlack ? this.blackKeyHeight : this.whiteKeyHeight,
                black: isBlack,
            }
        }
        return this.keyDimensions[ noteNumber ]
    }
    getKeyX(noteNumber, isBlack) {
        return ( noteNumber -
            Math.floor( Math.max( 0, ( noteNumber + 11 ) ) / 12 ) -
            Math.floor( Math.max( 0, ( noteNumber + 8 ) ) / 12 ) -
            Math.floor( Math.max( 0, ( noteNumber + 6 ) ) / 12 ) -
            Math.floor( Math.max( 0, ( noteNumber + 3 ) ) / 12 ) -
            Math.floor( Math.max( 0, ( noteNumber + 1 ) ) / 12 )
            ) * this.whiteKeyWidth + ( this.whiteKeyWidth - this.blackKeyWidth / 2 ) * isBlack;
            //for xPos only the amount of white keys matter since the black are placed on top.
    }
    getNoteDimensions( noteNumber, currentTime, start, end ) {
        noteNumber -= 21;
        let dur = end - start;
        let isBlack = this.isBlack( noteNumber )
        let x = this.getKeyX(noteNumber, isBlack)

        let h = dur / this.noteToHeightConst * ( this.height - this.whiteKeyHeight )
        let y = ( this.height - this.whiteKeyHeight ) - ( end - currentTime ) / this.noteToHeightConst * ( this.height - this.whiteKeyHeight );
        return {
            x: x,
            y: y,
            w: isBlack ? this.blackKeyWidth : this.whiteKeyWidth,
            h: h,
            black: isBlack,
        }

    }
    isBlack( noteNumber ) {
        return (
            ( ( noteNumber + 11 ) % 12 == 0 ) ||
            ( ( noteNumber + 8 ) % 12 == 0 ) ||
            ( ( noteNumber + 6 ) % 12 == 0 ) ||
            ( ( noteNumber + 3 ) % 12 == 0 ) ||
            ( ( noteNumber + 1 ) % 12 == 0 )
        ) ? 1 : 0
    }
    drawRoundRect( ctx, x, y, width, height, radius ) {
        radius = radius * 2 < ( Math.min( height, width ) ) ? radius : ( Math.min( height, width ) ) / 2
        if ( typeof radius === 'undefined' ) {
            radius = 0;
        }
        if ( typeof radius === 'number' ) {
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
            for ( var side in defaultRadius ) {
                radius[ side ] = radius[ side ] || defaultRadius[ side ];
            }
        }

        ctx.beginPath();
        ctx.moveTo( x + radius.tl, y );
        ctx.lineTo( x + width - radius.tr, y );
        ctx.lineTo( x + width, y + radius.tr );
        ctx.lineTo( x + width, y + height - radius.br );
        ctx.lineTo( x + width - radius.br, y + height );
        ctx.lineTo( x + radius.bl, y + height );
        ctx.lineTo( x, y + height - radius.bl );
        ctx.lineTo( x, y + radius.tl );
        ctx.lineTo( x + radius.tl, y );


        ctx.closePath();

    }
    drawPiano( ctxWhite, ctxBlack ) {

        //Background
        ctxWhite.fillStyle = "rgba(0,0,0,1)";
        ctxWhite.fillRect( 0, 5, this.width, this.height * 0.1 );
        // ctxWhite.fillStyle = "rgba(255,255,255,0.5)";
        ctxWhite.fillRect( 0, 5, this.width, this.height );

        //white keys
        for ( let i = 0; i < 88; i++ ) {
            let dims = this.getKeyDimensions( i );
            if ( !this.isBlack( i ) ) {
                this.drawWhiteKey( ctxWhite, dims )
            }
        }

        //black keys
        let rgr2 = ctxWhite.createLinearGradient( this.width / 2, -this.height * 0.05, this.width / 2, this.height * 0.1 );
        rgr2.addColorStop( 1, "rgba(30,30,30,1)" );
        rgr2.addColorStop( 0, "black" );
        ctxBlack.fillStyle = rgr2;
        for ( let i = 0; i < 88; i++ ) {
            let dims = this.getKeyDimensions( i );
            if ( this.isBlack( i ) ) {
                this.drawBlackKey( ctxBlack, dims )
            }
        }

        //velvet
        ctxWhite.strokeStyle = "rgba(155,50,50,1)";
        ctxWhite.shadowColor = "rgba(155,50,50,1)";
        ctxWhite.shadowOffsetY = 1;
        ctxWhite.shadowBlur = 4
        ctxWhite.lineWidth = 4;
        ctxWhite.beginPath();
        ctxWhite.moveTo( 52 * this.whiteKeyWidth, 2 )
        ctxWhite.lineTo( 0, 2 )
        ctxWhite.closePath()
        ctxWhite.stroke()
    }
    drawWhiteKey( ctx, dims ) {
        let radius = 4
        let x = dims.x
        let y = dims.y
        let height = dims.h
        let width = dims.w

        
        
        
        ctx.beginPath();
        ctx.moveTo( x + 1, y );
        ctx.lineTo( x - 1 + width, y );
        ctx.lineTo( x - 1 + width, y + height - radius );
        ctx.lineTo( x - 1 + width - radius, y + height );
        ctx.lineTo( x + 1 + radius, y + height );
        ctx.lineTo( x + 1, y + height - radius );
        ctx.lineTo( x + 1, y );


        ctx.fillStyle = "white";
        ctx.fill();
        
        
        
        let rgr = ctx.createLinearGradient( x, this.whiteKeyHeight / 2,x +  width, this.whiteKeyHeight / 2 );
        rgr.addColorStop( 0.9, "rgba(0,0,0,0.3)" );
        rgr.addColorStop( 0.5, "rgba(0,0,0,0)" );
        rgr.addColorStop( 0.1, "rgba(0,0,0,0.3)" );
        ctx.fillStyle = rgr;
        ctx.fill();
        
        
        let rgr2 = ctx.createLinearGradient( this.width / 2, 0, this.width / 2, this.whiteKeyHeight );
        rgr2.addColorStop( 1, "rgba(255,255,255,0.5)" );
        rgr2.addColorStop( 0, "rgba(0,0,0,0.6)" );
        ctx.fillStyle = rgr2;
        ctx.fill();

        ctx.closePath();
    }
    drawBlackKey( ctx, dims ) {
        let radius = 3
        let x = dims.x
        let y = dims.y + 1.5
        let height = dims.h
        let width = dims.w

        
        
        
        ctx.beginPath();
        ctx.moveTo( x + 1, y );
        ctx.lineTo( x - 1 + width, y );
        ctx.lineTo( x - 1 + width, y + height - radius );
        ctx.lineTo( x - 1 + width - radius, y + height );
        ctx.lineTo( x + 1 + radius, y + height );
        ctx.lineTo( x + 1, y + height - radius );
        ctx.lineTo( x + 1, y );


        ctx.fillStyle = "black";
        ctx.fill();
        
        
        
        let rgr = ctx.createLinearGradient( x, this.whiteKeyHeight / 2,x +  width, this.whiteKeyHeight / 2 );
        rgr.addColorStop( 0.9, "rgba(0,0,0,0.3)" );
        rgr.addColorStop( 0.5, "rgba(0,0,0,0)" );
        rgr.addColorStop( 0.1, "rgba(0,0,0,0.3)" );
        ctx.fillStyle = rgr;
        ctx.fill();
        
        
        let rgr2 = ctx.createLinearGradient( this.width / 2, 0, this.width / 2, this.whiteKeyHeight );
        rgr2.addColorStop( 1, "rgba(0,0,0,0.5)" );
        rgr2.addColorStop( 0, "rgba(0,0,0,0.6)" );
        ctx.fillStyle = rgr2;
        ctx.fill();

        ctx.closePath();
    }

}
