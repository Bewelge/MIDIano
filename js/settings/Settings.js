import { getDefaultSettings } from "./DefaultSettings.js"
import { SettingUI } from "./SettingUI.js"

class Settings {
	constructor(ui) {
		this.settingsUi = new SettingUI()
		this.settings = getDefaultSettings()
		this.settingsValues = {}
		Object.keys(this.settings).forEach(tabId =>
			Object.keys(this.settings[tabId]).forEach(categoryId =>
				this.settings[tabId][categoryId].forEach(
					setting => (this.settingsValues[setting.id] = setting.value)
				)
			)
		)
	}
	setSettingValue(settingId, value) {
		this.settingsValues[settingId] = value
	}
}

const globalSettings = new Settings()
export const getSetting = settingId => {
	if (globalSettings == null) {
		globalSettings = new Settings()
	}
	return globalSettings.settingsValues[settingId]
}
export const setSetting = (settingId, value) => {
	globalSettings.settingsValues[settingId] = value
}
export const getSettingsDiv = () => {
	return globalSettings.settingsUi.getSettingsDiv(globalSettings.settings)
}
