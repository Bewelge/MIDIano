import { getSetting } from "../settings/Settings.js"

const TIME_CONST = 0.05
class GainNodeController {
	constructor(context) {
		this.createGainNode(context)
	}
	createGainNode(context) {
		this.gainNode = context.createGain()
		this.gainNode.value = 0
		this.gainNode.gain.setTargetAtTime(0, 0, TIME_CONST)
	}

	setAttackAndDecay(start, gainValue, adsrValues) {
		let endOfAttackTime = start + adsrValues.attack

		this.sustainValue = gainValue * adsrValues.sustain
		this.endOfDecayTime = endOfAttackTime + adsrValues.decay

		//Start at 0
		this.gainNode.gain.linearRampToValueAtTime(0, start, TIME_CONST)

		//Attack
		this.gainNode.gain.linearRampToValueAtTime(
			gainValue,
			endOfAttackTime,
			TIME_CONST
		)
		//Decay
		this.gainNode.gain.linearRampToValueAtTime(
			this.sustainValue,
			this.endOfDecayTime,
			TIME_CONST
		)
	}
	setReleaseGainNode(end, release) {
		this.gainNode.gain.linearRampToValueAtTime(
			this.sustainValue,
			end,
			TIME_CONST
		)
		//Release
		this.gainNode.gain.linearRampToValueAtTime(0.001, end + release)
		this.gainNode.gain.linearRampToValueAtTime(
			0,
			end + release + 0.001,
			TIME_CONST
		)
		this.gainNode.gain.setTargetAtTime(0, end + release + 0.005, TIME_CONST)
	}
	endAt(endTime, isSustained) {
		const release = isSustained
			? parseFloat(getSetting("adsrReleasePedal"))
			: parseFloat(getSetting("adsrReleaseKey"))
		endTime = Math.max(endTime, this.endOfDecayTime)
		this.setReleaseGainNode(endTime, release)
		return endTime
	}
}

function getAdsrValues() {
	let attack = parseFloat(getSetting("adsrAttack"))
	let decay = parseFloat(getSetting("adsrDecay"))
	let sustain = parseFloat(getSetting("adsrSustain")) / 100
	let releasePedal = parseFloat(getSetting("adsrReleasePedal"))
	let releaseKey = parseFloat(getSetting("adsrReleaseKey"))
	return { attack, decay, sustain, releasePedal, releaseKey }
}
function getAdsrAdjustedForDuration(duration) {
	let maxGainLevel = 1
	let adsrValues = getAdsrValues()
	//If duration is smaller than decay and attack, shorten decay / set it to 0
	if (duration < adsrValues.attack + adsrValues.decay) {
		adsrValues.decay = Math.max(duration - adsrValues.attack, 0)
	}
	//if attack alone is longer than duration, linearly lower the maximum gain value that will be reached before
	//the sound starts to release.
	if (duration < adsrValues.attack) {
		let ratio = duration / adsrValues.attack
		maxGainLevel *= ratio
		adsrValues.attack *= ratio
		adsrValues.decay = 0
		adsrValues.sustain = 1
	}
	adsrValues.maxGainLevel = maxGainLevel
	return adsrValues
}

export const createContinuousGainNode = (context, start, gainValue) => {
	const gainNodeGen = new GainNodeController(context)

	gainNodeGen.setAttackAndDecay(start, gainValue, getAdsrValues())
	return gainNodeGen
}

export const createCompleteGainNode = (
	context,
	gainValue,
	ctxTimes,
	isSustained
) => {
	const gainNodeGen = new GainNodeController(context)

	const adsrValues = getAdsrAdjustedForDuration(
		(isSustained ? ctxTimes.sustainOff : ctxTimes.end) - ctxTimes.start
	)

	//Adjust gain value if attack period is longer than duration of entire note.
	gainValue *= adsrValues.maxGainLevel

	gainNodeGen.setAttackAndDecay(ctxTimes.start, gainValue, adsrValues)

	let end = ctxTimes.end
	let release = parseFloat(getSetting("adsrReleaseKey"))
	if (isSustained && getSetting("sustainEnabled")) {
		end = ctxTimes.sustainOff
		release = parseFloat(getSetting("adsrReleasePedal"))
	}

	return gainNodeGen
}
