class Player {
    constructor(buffers) {
        this.soundfontName = 'MusyngKite'
        //Number of seconds that are added to the beginning of the song
        this.startDelay = 2

        this.queue = []
        this.buffers = buffers || {}
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.channels = this.getDefaultChannels()
        this.sources = []

        this.context = new AudioContext();
        this.lastTime = this.context.currentTime
        this.progress = 0
        this.paused = true
        this.playing = false
        this.scrolling = 0
        this.loadedSongs = new Set()
        this.muted = false
        this.volume = 100
        this.mutedAtVolume = 100

        this.newSongCallbacks = []
        this.onloadStartCallbacks = []
        this.onloadStopCallbacks = []

        this.playbackSpeed = 1
    }
    addNewSongCallback(callback) {
        this.newSongCallbacks.push(callback)
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
    getTimeWithScrollOffset(scrollOffset) {
        return this.progress - this.startDelay - scrollOffset
    }
    getTime() {
        // let time = this.context.currentTime - this.startContextTime - this.startDelay 
        // time = isNaN(time) ? 0 : time;
        return this.progress - this.startDelay - this.scrollOffset
    }
    setTime(seconds) {
        this.progress += seconds - this.getTime()
    }
    getSong() {
        return this.song
    }
    getChannel(track) {
        if (this.song.activeTracks[track].notes.length) {
            return this.channels[this.song.activeTracks[track].notes[0].channel]
        }
    }
    setupTracks() {
        this.tracks = {}
        for (let t in this.song.activeTracks) {
            if (!this.tracks.hasOwnProperty(t)) {
                this.tracks[t] = {
                    draw: true,
                    color: CONST.TRACK_COLORS[t % 4],
                    volume: 100,
                    name: this.song.activeTracks[t].name || "Track " + t
                }

            }
            this.tracks[t].color = CONST.TRACK_COLORS[t % 4]
        }
    }
    async setSoundfont(soundfontName) {
        this.pause()
        this.soundfontName = soundfontName
        return await this.getBuffers().then(res => console.log("Loaded Soundfont"))
    }
    async getBuffers() {
        return await SoundfontLoader.getBuffers(this.context).then((buffers) => {
            console.log("Buffers loaded")
            player.setBuffers(buffers);
            this.onloadStopCallbacks.forEach(callback => callback())
            this.loading = false
        })
    }
    async loadSong(theSong, fileName, setLoadMessage) {
        setLoadMessage("Loading " + fileName + ".")
        if (this.context.state == 'running') {
            this.context.suspend()
        }
        this.onloadStartCallbacks.forEach(callback => callback())

        this.playing = false
        this.progress = 0
        this.scrollOffset = 0
        this.paused = true
        this.loading = true
        setLoadMessage("Parsing Midi File.")
        let midiFile = await MidiLoader.loadFile(theSong);
        currentSong = new Song(midiFile, fileName)
        setLoadMessage("Loading Instruments")

        this.setSong(currentSong)
        this.loadedSongs.add(currentSong)
        if (!this.buffers.hasOwnProperty(this.soundfontName)) {
            this.buffers[this.soundfontName] = {}
        }
        //filter instruments we've loaded already and directly map onto promise
        let neededInstruments = currentSong.getAllInstruments()
            .filter(instrument => !this.buffers[this.soundfontName].hasOwnProperty(instrument))
            .map(instrument => SoundfontLoader.loadInstrument(instrument, soundfontName))
        await Promise.all(neededInstruments)

        this.setupTracks()
        this.newSongCallbacks.forEach(callback => callback())
        setLoadMessage("Creating Buffers")
        return player.getBuffers()
    }
    async loadNeededInstruments() {

    }
    setBuffers(buffers) {
        this.buffers[this.soundfontName] = buffers;
    }
    setSong(song) {
        this.pause()
        this.playing = false;
        this.paused = true;
        this.progress = 0;
        this.scrollOffset = 0
        this.song = song
    }
    startPlay() {
        console.log("Starting Song")
        this.paused = false
        this.playing = true
        this.noteSequence = this.song.getNoteSequence()
        this.lastTime = this.context.currentTime
        this.context.resume()
        this.play()
    }
    handleScroll(stacksize) {
        if (this.scrolling != 0) {
            this.lastTime = this.context.currentTime
            let newScrollOffset =  this.scrollOffset +  0.01 * this.scrolling
            let newTime = this.getTimeWithScrollOffset(newScrollOffset)
            if (this.getSong()) {
                if (newTime > 1 + this.getSong().getEnd() / 1000) {
                    newScrollOffset = this.scrollOffset + ((1 + this.getSong().getEnd() / 1000) - this.getTime())
                }
            }
            if (newTime < -this.startDelay) {
                newScrollOffset = this.scrollOffset + (-this.startDelay - this.getTime())
            }
            this.scrollOffset = newScrollOffset
            this.scrolling =
                (Math.abs(this.scrolling)
                    - Math.max(Math.abs(this.scrolling * 0.006), this.playbackSpeed * 0.001))
                * (Math.abs(this.scrolling) / this.scrolling)
            if (Math.abs(this.scrolling) <= this.playbackSpeed * 0.01) {
                this.scrolling = 0
                this.noteSequence = this.song.getNoteSequence()
            }
            if (!stacksize) stacksize = 0
            if (stacksize > 50) {
                window.setTimeout(() => {
                    this.handleScroll()
                }, 25)
                return
            }
            this.handleScroll(++stacksize)
            return
        }

    }
    play() {

        if (this.scrolling != 0) {
            window.setTimeout(this.play.bind(this), 20)
            return
        }

        this.progress += (this.context.currentTime - this.lastTime) * this.playbackSpeed
        this.lastTime = this.context.currentTime

        let currentTime = this.getTime()
        let currentSecond = Math.floor(currentTime)

        if (currentTime >= this.song.getEnd() / 1000) {
            this.pause()
            return
        }

        while (this.noteSequence.length && this.noteSequence[0].timestamp / 1000 < currentTime + 0.2) {
            this.playNote(this.noteSequence.shift())
        }
        //this.setVolumes()
        for (let i = 0; i < currentSecond; i++) {
            if (!this.song.controlEvents.hasOwnProperty(i)) continue

            for (let c in this.song.controlEvents[i]) {
                let controlEvent = this.song.controlEvents[i][c]
                if (controlEvent.timestamp <= currentTime) {
                    if (controlEvent.controllerType == 7) {
                        this.channels[controlEvent.channel].volume = controlEvent.value
                    }
                }
            }
        }
        if (!this.paused) {
            window.requestAnimationFrame(this.play.bind(this))
        }
    }
    isPlaying() {
        return this.playing
    }
    stop() {
        this.progress = 0
        this.scrollOffset = 0
        this.playing = false
        this.pause()
    }
    resume() {
        console.log("Resuming Song")
        this.paused = false
        this.noteSequence = this.song.getNoteSequence()
        this.context.resume()
        this.play()
    }
    pause() {
        console.log("Pausing Song")
        this.sources.forEach(source => source.stop(0))
        this.context.suspend()
        this.pauseTime = this.getTime()
        this.paused = true
    }

    playNote(note) {
        if (!note.hasOwnProperty('channel') || !note.hasOwnProperty('noteNumber')) {
            return
        }
        let currentTime = (this.getTime())
        let contextTime = this.context.currentTime
        let delay = (note.timestamp / 1000 - currentTime) / this.playbackSpeed
        let duration = note.duration / this.playbackSpeed
        if (delay < 0) {
            return
        }
        let key = CONST.NOTE_TO_KEY[note.noteNumber]
        let channel = this.channels[note.channel]
        let track = this.tracks[note.track]
        let buffer
        try {
            buffer = this.buffers[this.soundfontName][note.instrument][key]
        } catch (e) {
            console.log(e)
            console.log(this.buffers)
            console.log(note.instrument)
        }

        var gain = (note.velocity / 127) * channel.volume / 127 * track.volume / 100 * 2 * this.volume / 100
        if (gain == 0) {
            return
        }

        let source = this.context.createBufferSource();
        let gainNode = this.context.createGain();
        source.buffer = buffer
        source.connect(gainNode);


        gainNode.value = 0
        gainNode.gain.setTargetAtTime(0, contextTime, 0.1)
        gainNode.gain.setTargetAtTime(Math.min(1.0, Math.max(-1.0, gain)), contextTime + delay, 0.1);
        gainNode.gain.setTargetAtTime(Math.min(1.0, Math.max(-1.0, gain)), contextTime + delay + (note.duration / 1000) / this.playbackSpeed, 0.1);
        gainNode.gain.linearRampToValueAtTime(0, contextTime + delay + duration / 1000 + 0.1)
        gainNode.connect(this.context.destination);

        source.start(Math.max(0, contextTime + delay));
        source.stop(contextTime + delay + (note.duration) / 1000 + 0.1)

        this.sources.push(source)
    }

}