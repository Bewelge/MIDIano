import { FileLoader } from "../player/FileLoader.js"
import { getCurrentSong, getPlayer } from "../player/Player.js"
import { replaceAllString } from "../Util.js"
import { DomHelper } from "./DomHelper.js"
import { getLoader } from "./Loader.js"

export class SongUI {
	constructor() {
		this.songDivs = {}
		this.wrapper = DomHelper.createDiv()
	}
	getDivContent() {
		return this.wrapper
	}
	setExampleSongs(jsonSongs) {
		jsonSongs.forEach(exampleSongJson => {
			let songDivObj = createUnloadedSongDiv(exampleSongJson)
			this.songDivs[exampleSongJson.fileName] = songDivObj
			this.wrapper.appendChild(songDivObj.wrapper)
		})
	}
	newSongCallback(song) {
		if (!this.songDivs.hasOwnProperty(song.fileName)) {
			let songDivObj = createLoadedSongDiv(song)
			this.songDivs[song.fileName] = songDivObj
			this.wrapper.appendChild(songDivObj.wrapper)
		} else {
			this.replaceNowLoadedSongDiv(song)
		}
		DomHelper.removeClassFromElementsSelector(".songButton", "selected")
		DomHelper.addClassToElement("selected", song.div)
	}
	replaceNowLoadedSongDiv(song) {
		song.div = this.songDivs[song.fileName].button
		song.div.onclick = () => loadedButtonClickCallback(song)
	}
}
function createUnloadedSongDiv(songJson) {
	let wrapper = DomHelper.createDivWithIdAndClass(
		"songWrap" + replaceAllString(songJson.fileName, " ", "_"),
		"innerMenuContDiv"
	)
	let button = createUnloadedSongButton(songJson)

	wrapper.appendChild(button)

	return {
		wrapper: wrapper,
		name: songJson.name,
		button: button
	}
}

function createLoadedSongDiv(song) {
	let wrapper = DomHelper.createDivWithIdAndClass(
		"songWrap" + replaceAllString(song.fileName, " ", "_"),
		"innerMenuContDiv"
	)
	let button = createLoadedSongButton(song)
	song.div = button
	wrapper.appendChild(song.div)

	return {
		wrapper: wrapper,
		name: song.name,
		button: button
	}
}
function createUnloadedSongButton(songJson) {
	let but = DomHelper.createTextButton(
		"song" + replaceAllString(songJson.fileName, " ", "_"),
		songJson.name,
		() => {
			getLoader().setLoadMessage("Downloading Song")
			FileLoader.loadSongFromURL(songJson.url, respone => {
				getPlayer().loadSong(respone, songJson.fileName, songJson.name)
			})
		}
	)
	but.classList.add("songButton")
	return but
}
function createLoadedSongButton(song) {
	let but = DomHelper.createTextButton(
		"song" + replaceAllString(song.fileName, " ", "_"),
		song.name,
		() => loadedButtonClickCallback(song)
	)
	but.classList.add("songButton")
	return but
}

function loadedButtonClickCallback(song) {
	let currentSong = getCurrentSong()
	if (currentSong != song) {
		DomHelper.removeClassFromElementsSelector(".songButton", "selected")
		DomHelper.addClassToElement("selected", song.div)
		getPlayer().setSong(song)
	}
}
