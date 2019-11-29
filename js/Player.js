class Player {
    constructor(buffers) {
        this.queue = []
        this.buffers = buffers || {}
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.channels = this.getDefaultChannels()
        this.notesToPlay = new Set()
        this.notesPlaying = new Set()
        this.notesPlayed = new Set()
        this.startTime = this.context.currentTime
        this.sources=[]

        this.paused = true
        this.playing = false
    }
    getDefaultChannels() {
        let channels = {}
        for (var i = 0; i <= 15; i++) {
            channels[i] = {
                instrument: i,
                pitchBend: 0,
                volume: 127,
                volumeControl: 50,
                mute: false,
                mono: false,
                omni: false,
                solo: false
            };
        }
        channels[9].instrument = -1;
        return channels
    }

    getContext() {
        return this.context
    }
    getTime() {
        return this.context.currentTime - (this.startContextTime ?  this.startContextTime : 0)
    }
    getSong() {
        return this.song
    }
    setBuffers(buffers) {
        this.buffers = buffers;
    }
    setSong(song) {
        this.song = song
    }
    startPlay() {
        console.log("Starting Song")
        this.paused = false
        this.playing = true
     
        this.noteSequence = this.song.getNoteSequence()
        this.startContextTime = this.context.currentTime
        this.context.resume()
        this.play()
    }
    play() {

        let currentTime = this.context.currentTime - this.startContextTime

        while (this.noteSequence.length && this.noteSequence[0].timestamp / 1000 < currentTime + 0.2) {
            this.playNote(this.noteSequence.shift())
        }




        if (!this.paused) {
            window.setTimeout(() => {
                this.play()
            }, 25)
        }


    }
    isPlaying() {
        return this.playing
    }
    resume() {
        console.log("Resuming  Song")
        this.paused = false
        
        this.noteSequence = this.song.getNoteSequence()
        //this.noteSequence.filter(note => note.offTime < this.context.currentTime - this.startContextTime)
        console.log(this.noteSequence[0])
        this.context.resume()
        this.play()
    }
    pause() {
        console.log("Pausing  Song")
        this.sources.forEach(source => source.stop(0))
        this.context.suspend()
        this.pauseTime = this.getTime()
        this.paused = true
    }

    playNote(note) {
        if (!note.hasOwnProperty('channel') || !note.hasOwnProperty('noteNumber')) {
            return
        }
        let currentTime = (this.context.currentTime - this.startContextTime)
        let delay = note.timestamp / 1000 - currentTime
        let key = CONST.NOTE_TO_KEY[note.noteNumber]
        let channel = this.channels[note.channel]
        let buffer
        try {
            buffer = this.buffers[note.instrument][key]

        } catch(e) {
            console.log(e)
            console.log(this.buffers)
            console.log(note.instrument)
        }


        let source = this.context.createBufferSource();
        source.buffer = buffer

        source.connect(this.context.destination)
        source.gainNode = this.context.createGain();
        var gain = (note.velocity / 127) * channel.volume * 2 - 1
        source.gainNode.value = gain;
        source.gainNode.connect(this.context.destination);

        //source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, gain));


        source.gainNode.gain.setTargetAtTime(Math.min(1.0, Math.max(-1.0, gain)), currentTime + delay, 0.1);
        source.gainNode.gain.setTargetAtTime(Math.min(1.0, Math.max(-1.0, gain)), currentTime + delay + note.duration / 1000, 0.1);
        source.gainNode.gain.linearRampToValueAtTime(0, currentTime + delay + (note.duration)  / 1000 + 0.1)
        source.connect(source.gainNode);

        /* source.connect(this.context.destination);  */

        source.start(Math.max(0, currentTime + delay));
        source.stop(currentTime + delay + (note.duration)  / 1000 + 0.1)

        this.sources.push(source);
    }
    
}