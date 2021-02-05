import { DomHelper } from "./DomHelper.js"
import {
	getTrack,
	getTrackColor,
	getTracks,
	setTrackColor
} from "../player/Tracks.js"
import { getPlayer } from "../player/Player.js"
import { SettingUI } from "./SettingUI.js"
import { ElementHighlight } from "./ElementHighlight.js"
import { Notification } from "./Notification.js"

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

	//Instrument
	let currentInstrument = getPlayer().getCurrentTrackInstrument(trackObj.index)
	instrumentName = DomHelper.createDivWithIdAndClass(
		"instrumentName" + trackObj.index,
		"instrumentName"
	)
	instrumentName.innerHTML = currentInstrument

	window.setInterval(
		() =>
			(instrumentName.innerHTML = getPlayer().getCurrentTrackInstrument(
				trackObj.index
			)),
		2000
	)

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
	hideButton = SettingUI.createSettingDiv({
		type: "checkbox",
		label: "Show track",
		value: trackObj.draw,
		onChange: () => {
			if (trackObj.draw) {
				trackObj.draw = false
			} else {
				trackObj.draw = true
			}
		}
	})
	// hideButton = DomHelper.createGlyphiconButton(
	// 	"hide" + trackId,
	// 	"eye-open",
	// 	ev => {
	// 	}
	// )

	//Mute Track
	muteButton = SettingUI.createSettingDiv({
		type: "checkbox",
		label: "Mute track",
		value: trackObj.volume == 0,
		onChange: () => {
			if (trackObj.volume == 0) {
				let volume = trackObj.volumeAtMute || 127
				trackObj.volume = volume
				volumeSlider.slider.value = volume
				trackObj.volumeAtMute = 0
			} else {
				trackObj.volumeAtMute = trackObj.volume
				trackObj.volume = 0
				volumeSlider.slider.value = 0
			}
		}
	})

	//Require Track to play along
	requireToPlayAlongButton = SettingUI.createSettingDiv({
		type: "checkbox",
		label: "Require playalong",
		value: trackObj.requiredToPlay,
		isChecked: () => trackObj.requiredToPlay,
		onChange: () => {
			console.log(trackObj.requiredToPlay)
			if (!trackObj.requiredToPlay) {
				if (!getPlayer().midiInputHandler.isAnyInputSet()) {
					Notification.create(
						"You have to choose a Midi Input Device to play along.",
						5000
					)
					new ElementHighlight(document.querySelector("#midiInput"))

					return
				}
				trackObj.requiredToPlay = true
			} else {
				trackObj.requiredToPlay = false
			}
		}
	})

	let colorPickerWhite = SettingUI.createColorSettingDiv({
		type: "color",
		label: "White note color",
		value: getTrackColor(trackId).white,
		onChange: colorString => setTrackColor(trackId, "white", colorString)
	})
	let colorPickerBlack = SettingUI.createColorSettingDiv({
		type: "color",
		label: "Black note color",
		value: getTrackColor(trackId).black,
		onChange: colorString => setTrackColor(trackId, "black", colorString)
	})

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
		instrumentName,
		DomHelper.getDivider(),
		volumeSlider.container,
		btnGrp
	])

	return trackDiv
}
