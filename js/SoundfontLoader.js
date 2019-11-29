class SoundfontLoader {
    constructor(audioCtx) {
        this.buffers = {}
        this.ctx = audioCtx;
    }

    /**
    * 
    * @param {String} instrument 
    */
    static async loadInstrument(instrument) {
        return fetch('http://gleitz.github.io/midi-js-soundfonts/MusyngKite/' + instrument + '-ogg.js')
            .then((response) => {
                if (response.ok) {
                    return response.text()
                }
                throw Error(response.statusText)
            })
            .then((data) => {
                let scr = document.createElement("script")
                scr.language = 'javascript';
                scr.type = 'text/javascript';
                scr.text = data;
                document.body.appendChild(scr);
            })
            .catch(function (error) {
                console.log('Looks like there was a problem: \n', error);
            });

    }
    static async loadInstruments(instruments) {
        console.log(instruments)
        return await Promise.all(instruments.slice(0).map(instrument => SoundfontLoader.loadInstrument(instrument)))
    }
    static async getBuffers(ctx) {
        let sortedBuffers = null;
        let unsortedBuffers = await SoundfontLoader.createBuffers(ctx).then(unsortedBuffers => {
            let buffers = {};
            console.log(1,unsortedBuffers)
            for (let b in unsortedBuffers) {
                let buffer = unsortedBuffers[b]
                if (!buffers.hasOwnProperty(buffer.instrument)) {
                    buffers[buffer.instrument] = {}
                }
                buffers[buffer.instrument][buffer.note] = buffer.buffer
            }
            sortedBuffers = buffers;
        })
        console.log(unsortedBuffers)
        return sortedBuffers
    }
    static async createBuffers(ctx) {
        let promises = []
        for (let instrument in MIDI.Soundfont) {
            console.log(instrument)
            for (let note in MIDI.Soundfont[instrument]) {
                let base64Buffer = SoundfontLoader.getBase64Buffer(MIDI.Soundfont[instrument][note])
                promises.push(SoundfontLoader.getNotePromise(ctx, base64Buffer, note, instrument))
            }
        }
        return await Promise.all(promises)
    }
    static async getNotePromise(ctx, base64Buffer, note, instrument) {
        let audioBuffer;
        return await ctx.decodeAudioData(base64Buffer, function (decodedBuffer) {
            audioBuffer = decodedBuffer;
        }).then(() => {
            return {
                buffer: audioBuffer,
                note: note,
                instrument: instrument
            }
        })
    }
    static getBase64Buffer(str) {
        let base64 = str.split(',')[1];
        return Base64Binary.decodeArrayBuffer(base64);
    }
}
