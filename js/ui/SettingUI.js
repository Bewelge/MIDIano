import { resetSettingsToDefault } from "../settings/Settings.js"
import { DomHelper } from "../ui/DomHelper.js"
import { groupArrayBy } from "../Util.js"
/**
 * Class to create the DOM Elements used to manipulate the settings.
 */
export class SettingUI {
	constructor() {
		this.tabs = {}
		this.activeTab = "General"
		this.mainDiv = null
	}
	/**
	 * returns a div with the following structure:
	 * 	.settingsContainer {
	 * 		.settingsTabButtonContainer {
	 * 			.settingsTabButton ...
	 * 		}
	 * 		.settingsContentContainer {
	 * 			.settingContainer ...
	 * 		}
	 * }
	 *
	 * @param {Object} settings  as defined in DefaultSettings.js
	 */
	getSettingsDiv(settings) {
		if (this.mainDiv == null) {
			this.mainDiv = DomHelper.createDivWithClass("settingsContainer")
			this.mainDiv.appendChild(this.getTabDiv(Object.keys(settings)))
			this.mainDiv.appendChild(this.getContentDiv(settings))

			this.mainDiv
				.querySelectorAll(".settingsTabContent" + this.activeTab)
				.forEach(el => (el.style.display = "block"))
			this.mainDiv
				.querySelector("#" + this.activeTab + "Tab")
				.classList.add("selected")
		}
		return this.mainDiv
	}
	getTabDiv(tabIds) {
		let cont = DomHelper.createDivWithClass("settingsTabButtonContainer")
		tabIds.forEach(tabId => {
			let tabButton = this.createTabButton(tabId)
			tabButton.classList.add("settingsTabButton")
			cont.appendChild(tabButton)
		})
		return cont
	}
	createTabButton(tabName) {
		let butEl = DomHelper.createTextButton(tabName + "Tab", tabName, ev => {
			document
				.querySelectorAll(".settingsTabButton")
				.forEach(el => el.classList.remove("selected"))

			butEl.classList.add("selected")

			document
				.querySelectorAll(".settingsTabContentContainer")
				.forEach(settingEl => (settingEl.style.display = "none"))
			document
				.querySelectorAll(".settingsTabContent" + tabName)
				.forEach(settingEl => (settingEl.style.display = "block"))
		})
		return butEl
	}
	getContentDiv(settings) {
		let cont = DomHelper.createDivWithClass("settingsContentContainer")
		Object.keys(settings).forEach(tabId => {
			cont.appendChild(this.createSettingTabContentDiv(tabId, settings[tabId]))
		})

		return cont
	}
	createSettingTabContentDiv(tabName, settingGroups) {
		let cont = DomHelper.createDivWithClass(
			"settingsTabContentContainer settingsTabContent" + tabName
		)
		Object.keys(settingGroups).forEach(groupId => {
			cont.appendChild(
				this.createSettingGroupDiv(groupId, settingGroups[groupId])
			)
		})
		if (tabName == "General") {
			cont.appendChild(this.getResetButton())
		}
		return cont
	}
	getResetButton() {
		let but = DomHelper.createTextButton(
			"settingsResetButton",
			"Reset to defaults",
			() => {
				resetSettingsToDefault()
			}
		)
		return but
	}
	createSettingGroupDiv(categoryName, settingsList) {
		let cont = DomHelper.createDivWithClass(
			"settingsGroupContainer innerMenuContDiv"
		)
		if (categoryName != "default") {
			cont.classList.add("collapsed")
			let label = DomHelper.createElementWithClass(
				"settingsGroupLabel clickableTitle",
				"div",
				{},
				{ innerHTML: categoryName + ": " }
			)
			cont.appendChild(label)

			let collapsed = true
			let glyph = DomHelper.getGlyphicon("plus")
			glyph.classList.add("collapserGlyphSpan")
			label.appendChild(glyph)

			label.onclick = () => {
				if (collapsed == true) {
					collapsed = false
					cont.classList.remove("collapsed")
					DomHelper.replaceGlyph(label, "plus", "minus")
				} else {
					collapsed = true
					cont.classList.add("collapsed")
					DomHelper.replaceGlyph(label, "minus", "plus")
				}
			}
		}

		settingsList.forEach(setting =>
			cont.appendChild(SettingUI.createSettingDiv(setting))
		)
		return cont
	}
	static createSettingDiv(setting) {
		switch (setting.type) {
			case "list":
				return SettingUI.createListSettingDiv(setting)
			case "checkbox":
				return SettingUI.createCheckboxSettingDiv(setting)
			case "slider":
				return SettingUI.createSliderSettingDiv(setting)
			case "color":
				return SettingUI.createColorSettingDiv(setting)
		}
	}
	static createListSettingDiv(setting) {
		let el = DomHelper.createInputSelect(
			setting.label,
			setting.list,
			setting.onChange
		)
		el.classList.add("settingContainer")
		return el
	}
	static createCheckboxSettingDiv(setting) {
		let el = DomHelper.createCheckbox(
			setting.label,
			setting.onChange,
			setting.value,
			setting.isChecked
		)
		el.classList.add("settingContainer")
		return el
	}
	static createSliderSettingDiv(setting) {
		let el = DomHelper.createSliderWithLabelAndField(
			setting.id + "Slider",
			setting.label,
			parseFloat(setting.value),
			setting.min,
			setting.max,
			setting.step,
			setting.onChange
		).container
		el.classList.add("settingContainer")
		return el
	}
	static createColorSettingDiv(setting) {
		return DomHelper.createColorPickerText(
			setting.label,
			setting.value,
			setting.onChange
		)
	}
}
