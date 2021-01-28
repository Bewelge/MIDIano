import { DomHelper } from "../DomHelper.js"
import { groupArrayBy } from "../Util.js"
/**
 * Class to create the DOM Elements used to manipulate the settings.
 */
export class SettingUI {
	constructor() {
		this.tabs = {}
		this.activeTab = "Video"
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
		//	this.tabsToSettingsMap = groupArrayBy(settings, setting => setting.tab)

		let cont = DomHelper.createDivWithClass("settingsContainer")
		cont.appendChild(this.getTabDiv(Object.keys(settings)))
		cont.appendChild(this.getContentDiv(settings))

		cont
			.querySelectorAll(".settingsTabContent" + this.activeTab)
			.forEach(el => (el.style.display = "block"))
		cont.querySelector("#" + this.activeTab + "Tab").classList.add("selected")

		return cont
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
		return cont
	}
	createSettingGroupDiv(categoryName, settingsList) {
		let cont = DomHelper.createDivWithClass(
			"settingsGroupContainer innerMenuContDiv"
		)
		if (categoryName != "default") {
			let label = DomHelper.createElementWithClass(
				"settingsGroupLabel",
				"span",
				{},
				{ innerHTML: categoryName + ": " }
			)
			cont.appendChild(label)
		}
		settingsList.forEach(setting =>
			cont.appendChild(this.createSettingDiv(setting))
		)
		return cont
	}
	createSettingDiv(setting) {
		switch (setting.type) {
			case "list":
				return this.createListSettingDiv(setting)
			case "checkbox":
				return this.createCheckboxSettingDiv(setting)
			case "slider":
				return this.createSliderSettingDiv(setting)
			case "color":
				return this.createColorSettingDiv(setting)
		}
	}
	createListSettingDiv(setting) {
		let el = DomHelper.createInputSelect(
			setting.label,
			setting.list,
			setting.onChange
		)
		el.classList.add("settingContainer")
		return el
	}
	createCheckboxSettingDiv(setting) {
		let el = DomHelper.createCheckbox(
			setting.label,
			setting.onChange,
			setting.value
		)
		el.classList.add("settingContainer")
		return el
	}
	createSliderSettingDiv(setting) {
		let el = DomHelper.createSliderWithLabelAndField(
			setting.id + "Slider",
			setting.label,
			setting.value,
			setting.min,
			setting.max,
			setting.step,
			setting.onChange
		).container
		el.classList.add("settingContainer")
		return el
	}
	createColorSettingDiv(setting) {
		let cont = DomHelper.createDivWithClass("settingContainer")

		let label = DomHelper.createDivWithClass(
			"colorLabel settingLabel",
			{},
			{ innerHTML: setting.label }
		)

		let colorButtonContainer = DomHelper.createDivWithClass(
			"colorPickerButtonContainer"
		)
		let colorButton = DomHelper.createDivWithClass("colorPickerButton")
		colorButtonContainer.appendChild(colorButton)

		cont.appendChild(label)
		cont.appendChild(colorButtonContainer)

		let colorPicker = Pickr.create({
			el: colorButton,
			theme: "nano",
			components: {
				hue: true,
				preview: true,
				opacity: true,
				interaction: {
					input: true
				}
			}
		})
		cont.onclick = () => colorPicker.show()
		colorButtonContainer.style.backgroundColor = setting.value
		colorPicker.on("init", () => colorPicker.setColor(setting.value))
		colorPicker.on("change", color => {
			setting.onChange(color.toRGBA().toString())
			colorButtonContainer.style.backgroundColor = colorPicker
				.getColor()
				.toRGBA()
				.toString()
		})

		return cont
	}

	initColorPicker(setting, colorPickerEl) {
		const colorPicker = Pickr.create({
			el: colorPickerEl,
			theme: "nano",
			components: {
				hue: true,
				preview: true,
				opacity: true,
				interaction: {
					input: true
				}
			}
		})
		colorPicker.on("init", () => {
			colorPicker.setColor(setting.value)
			colorPickerEl.style.backgroundColor = "green"
			colorPicker.on("change", color => {
				let colorString = color.toRGBA().toString()
				setting.onChange(colorString)
			})
		})
	}
}
