class MidiLoader {
    /**
     * 
     * @param {String} url 
     */
    static async loadFile(url) {
        const response = await fetch(url);
        if (response.ok) {
            let arrayBuffer = await response.arrayBuffer();
            if (arrayBuffer) {

                arrayBuffer = new Uint8Array(arrayBuffer);

                return parseMidi(arrayBuffer);
            }
        } else {
            throw new Error(`could not load ${url}`);
        }
    }
    
}