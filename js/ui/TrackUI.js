import { DomHelper } from "./DomHelper.js"
import {
	getTrack,
	getTrackColor,
	getTracks,
	setTrackColor
} from "../player/Tracks.js"

/**
 *  Handles creation of the Track-Divs that give control over volume, diplay, color...
 *
 *  Directly changes values in the track objects
 */

export const createTrackDivs = () => {
	return Object.keys(getTracks()).map(trackId => createTrackDiv(trackId))
}

export const createTrackDiv = trackId => {
	const trackObj = getTrack(trackId)
	let volumeSlider,
		muteButton,
		hideButton,
		trackName,
		instrumentName,
		requireToPlayAlongButton

	let trackDiv = DomHelper.createDivWithIdAndClass(
		"trackDiv" + trackId,
		"innerMenuContDiv settingGroupContainer"
	)

	//Name
	trackName = DomHelper.createDivWithIdAndClass(
		"trackName" + trackId,
		"trackName"
	)
	trackName.innerHTML = trackObj.name || "Track " + trackId

	//TODO. Reimplement when player has been refactored to be accessed globally.
	// //Instrument
	// let currentInstrument = this.player.getCurrentTrackInstrument(
	// 	trackObj.index
	// )
	// instrumentName = DomHelper.createDivWithIdAndClass(
	// 	"instrumentName" + trackObj.index,
	// 	"instrumentName"
	// )
	// instrumentName.innerHTML = currentInstrument

	// window.setInterval(
	// 	() =>
	// 		(instrumentName.innerHTML = this.player.getCurrentTrackInstrument(
	// 			trackObj.index
	// 		)),
	// 	2000
	// )

	let btnGrp = DomHelper.createButtonGroup(false)

	//Track Volume
	volumeSlider = DomHelper.createSliderWithLabel(
		"volume" + trackId,
		"Volume",
		trackObj.volume,
		0,
		100,
		1,
		ev => {
			if (trackObj.volume == 0 && parseInt(ev.target.value) > 0) {
				DomHelper.replaceGlyph(muteButton, "volume-off", "volume-up")
			}
			trackObj.volume = parseInt(ev.target.value)
			if (trackObj.volume <= 0) {
				DomHelper.replaceGlyph(muteButton, "volume-up", "volume-off")
			}
		}
	)

	//Hide Track
	hideButton = DomHelper.createGlyphiconButton(
		"hide" + trackId,
		"eye-open",
		ev => {
			if (trackObj.draw) {
				DomHelper.replaceGlyph(hideButton, "eye-open", "eye-close")
				trackObj.draw = false
			} else {
				DomHelper.replaceGlyph(hideButton, "eye-close", "eye-open")
				trackObj.draw = true
			}
		}
	)

	//Mute Track
	muteButton = DomHelper.createGlyphiconButton(
		"mute" + trackId,
		"volume-up",
		() => {
			if (trackObj.volume == 0) {
				let volume = trackObj.volumeAtMute || 127
				trackObj.volume = volume
				volumeSlider.slider.value = volume
				DomHelper.replaceGlyph(muteButton, "volume-off", "volume-up")
				trackObj.volumeAtMute = 0
			} else {
				trackObj.volumeAtMute = trackObj.volume
				trackObj.volume = 0
				volumeSlider.slider.value = 0
				DomHelper.replaceGlyph(muteButton, "volume-up", "volume-off")
			}
		}
	)

	//Require Track to play along
	requireToPlayAlongButton = DomHelper.createGlyphiconTextButton(
		"require" + trackId,
		"minus-sign",
		"Play along",
		() => {
			if (!trackObj.requiredToPlay) {
				if (!this.midiInputHandler.isAnyInputSet()) {
					this.addNotification(
						"You have to choose a Midi Input Device to play along."
					)
					this.highlightElement(this.getMidiInputButton())
					return
				}
				DomHelper.replaceGlyph(
					requireToPlayAlongButton,
					"minus-sign",
					"plus-sign"
				)
				trackObj.requiredToPlay = true
			} else {
				trackObj.requiredToPlay = false
				DomHelper.replaceGlyph(
					requireToPlayAlongButton,
					"plus-sign",
					"minus-sign"
				)
			}
		}
	)

	let colorPickerWhite = DomHelper.createColorPickerGlyphiconText(
		"tint",
		"White",
		getTrackColor(trackId).white,
		colorString => setTrackColor(trackId, "white", colorString)
	)
	let colorPickerBlack = DomHelper.createColorPickerGlyphiconText(
		"tint",
		"Black",
		getTrackColor(trackId).black,
		colorString => setTrackColor(trackId, "black", colorString)
	)

	DomHelper.appendChildren(btnGrp, [
		hideButton,
		muteButton,
		DomHelper.getDivider(),
		requireToPlayAlongButton,
		DomHelper.getDivider(),
		colorPickerWhite,
		colorPickerBlack
	])

	DomHelper.appendChildren(trackDiv, [
		trackName,
		// instrumentName,
		DomHelper.getDivider(),
		volumeSlider.container,
		btnGrp
	])

	return trackDiv
}
