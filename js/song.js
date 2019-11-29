class Song {
    constructor(midiData) {
        console.log(midiData)
        this.name = ""
        this.text = []
        this.timeSignature
        this.keySignarture
        this.end = 0
        this.duration = 0
        this.speed = 1
        this.notesBySeconds = {}

        this.header = midiData.header
        this.tracks = midiData.tracks
        this.otherTracks = []
        this.activeTracks = []

        this.processEvents(midiData)
        console.log(this)
        console.log(this.getNoteSequence());



    }
    getNotes(from, to) {
        let secondStart = Math.floor(from)
        let secondEnd = Math.floor(to)
        let notes = []
        for (let i = secondStart; i < secondEnd; i++) {
            for (let track in this.activeTracks) {
                if (this.activeTracks[track].notesBySeconds.hasOwnProperty(i)) {
                    for (let n in this.activeTracks[track].notesBySeconds[i]) {
                        let note = this.activeTracks[track].notesBySeconds[i][n]
                        if (note.timestamp > from) {
                            notes.push(note)
                        }
                    }
                }

            }
        }
        return notes;
    }
    getAllInstruments() {

        let instruments = {}
        let programs = {};
        this.tracks.forEach(track => {
            track.forEach(event => {
                let channel = event.channel;

                if (event.type == 'programChange') {
                    programs[channel] = event.programNumber;
                } 
                
                if (event.type == 'noteOn') {
                    let program = programs[channel];
                    let instrument = CONST.INSTRUMENTS.BY_ID[isFinite(program) ? program : channel];
                    instruments[instrument.id] = true
                    event.instrument = instrument.id
                }
            })
        })
        return Object.keys(instruments)

      /*   let key = CONST.NOTE_TO_KEY[note.noteNumber]
        let channel = this.channels[note.channel]
        let instrumentNum = channel['instrument']
        let instrument = CONST.INSTRUMENTS.BY_ID[instrumentNum].id */
    }
    processEvents(midiData) {


        midiData.tracks.forEach(track => {
            let newTrack = {
                notes: [],
                meta: [],
                tempoChanges: []
            }

            this.distributeEvents(track, newTrack)

            if (newTrack.notes.length) {
                this.activeTracks.push(newTrack)
            } else {
                this.otherTracks.push(newTrack)
            }
        })

        this.activeTracks.forEach((track,trackIndex) => {
            track.notesBySeconds = {};
            Song.processNotes(track.notes);
            track.notes = track.notes.slice(0).filter(note => note.type == "noteOn")
            track.notes.forEach(note => note.track = trackIndex)
            this.setNotesBySecond(track)
        })
    }
    distributeEvents(track, newTrack) {
        track.forEach(event => {
            if (event.type == "noteOn" || event.type == "noteOff") {
                newTrack.notes.push(event);
            }
            else if (event.type == "setTempo") {
                newTrack.tempoChanges.push(event);
            }
            else if (event.type == "trackName") {
                newTrack.name = event.text;
            }
            else if (event.type == "text") {
                this.text.push(event.text);
            }
            else if (event.type == "timeSignature") {
                newTrack.timeSignature = event;
            }
            else if (event.type == "keySignature") {
                newTrack.keySignarture = event;
            }
            else {
                newTrack.meta.push(event);
            }
        });
    }

    setNotesBySecond(track) {
        track.notes.forEach(note => {
            let second = Math.floor(note.timestamp / 1000);
            if (track.notesBySeconds.hasOwnProperty(second)) {
                track.notesBySeconds[second].push(note);
            }
            else {
                track.notesBySeconds[second] = [note];
            }
        });
    }
    findLastNote() {

    }
    getNoteSequence() {
        if (!this.notesSequence) {
            let tracks = []
            for (let t in this.activeTracks) [
                tracks.push(this.activeTracks[t].notes)
            ]

            this.noteSequence = [].concat.apply([], tracks).sort((a, b) => a.timestamp - b.timestamp)
        }
        return this.noteSequence.slice(0)

    }

    static processNotes(notes) {
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i]
            if (note.type == "noteOn") {
                Song.findOffNote(i, notes.slice(0))
            }
        }
    }

    static findOffNote(index, notes) {
        let onNote = notes[index];
        for (let i = index + 1; i < notes.length; i++) {
            if (notes[i].type == "noteOff" &&
                onNote.noteNumber == notes[i].noteNumber) {
                onNote.offTime = notes[i].timestamp
                onNote.duration = onNote.offTime - onNote.timestamp
                
                break;
            }
        }
    }


}