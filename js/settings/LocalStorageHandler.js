import { getSettingObject } from "./Settings.js"

const SAVE_PATH_ROOT = "Midiano/SavedSettings"
export const getGlobalSavedSettings = () => {
	let obj = {}
	if (window.localStorage) {
		let storedObj = window.localStorage.getItem(SAVE_PATH_ROOT)
		if (storedObj) {
			obj = JSON.parse(storedObj)
		}
	}
	return obj
}

export const saveCurrentSettings = () => {
	if (window.localStorage) {
		let saveObj = getSettingObject()
		window.localStorage.setItem(SAVE_PATH_ROOT, JSON.stringify(saveObj))
	}
}
