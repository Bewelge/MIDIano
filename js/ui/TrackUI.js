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
import { getMidiHandler } from "../MidiInputHandler.js"

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
		requireToPlayAlongButton,
		clickableTitleDiv

	let trackDiv = DomHelper.createDivWithIdAndClass(
		"trackDiv" + trackId,
		"innerMenuContDiv settingGroupContainer",
		{
			borderLeft: "5px solid " + getTrackColor(trackId).white
		}
	)

	clickableTitleDiv = DomHelper.createDivWithClass("clickableTitle")
	let collapsed = instrumentName == "percussion" ? true : false

	let glyph = DomHelper.getGlyphicon(collapsed ? "plus" : "minus")
	glyph.classList.add("collapserGlyphSpan")
	clickableTitleDiv.appendChild(glyph)

	if (collapsed) {
		trackDiv.classList.add("collapsed")
	}
	clickableTitleDiv.onclick = () => {
		if (collapsed) {
			collapsed = false
			trackDiv.classList.remove("collapsed")
			DomHelper.replaceGlyph(clickableTitleDiv, "plus", "minus")
		} else {
			collapsed = true
			trackDiv.classList.add("collapsed")
			DomHelper.replaceGlyph(clickableTitleDiv, "minus", "plus")
		}
	}

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
	volumeSlider = SettingUI.createSettingDiv({
		type: "slider",
		label: "Volume ",
		value: trackObj.volume,
		min: 0,
		max: 200,
		step: 1,
		onChange: value => {
			if (trackObj.volume == 0 && value != 0) {
				muteButton.querySelector("input").checked = false
			} else if (trackObj.volume != 0 && value == 0) {
				muteButton.querySelector("input").checked = true
			}
			trackObj.volume = parseInt(value)
		}
	})
	// DomHelper.createSliderWithLabel(
	// 	"volume" + trackId,
	// 	"Volume",
	// 	trackObj.volume,
	// 	0,
	// 	200,
	// 	1,
	// 	ev => {
	// 		trackObj.volume = parseInt(ev.target.value)
	// 	}
	// )

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

	//Mute Track
	muteButton = SettingUI.createSettingDiv({
		type: "checkbox",
		label: "Mute track",
		value: trackObj.volume == 0,
		onChange: () => {
			let volumeSliderInput = volumeSlider.querySelector("input")
			let volumeSliderLabel = volumeSlider.querySelector(".sliderVal")
			if (trackObj.volume == 0) {
				let volume = trackObj.volumeAtMute || 100
				trackObj.volume = volume
				volumeSliderInput.value = volume
				trackObj.volumeAtMute = 0
				volumeSliderLabel.innerHTML = volume
			} else {
				trackObj.volumeAtMute = trackObj.volume
				trackObj.volume = 0
				volumeSliderInput.value = 0
				volumeSliderLabel.innerHTML = 0
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
				if (!getMidiHandler().isInputActive()) {
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
		onChange: colorString => {
			trackDiv.style.borderLeft = "5px solid " + colorString
			setTrackColor(trackId, "white", colorString)
		}
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

	DomHelper.appendChildren(clickableTitleDiv, [trackName, instrumentName])
	DomHelper.appendChildren(trackDiv, [
		clickableTitleDiv,
		DomHelper.getDivider(),
		volumeSlider,
		btnGrp
	])

	return trackDiv
}
