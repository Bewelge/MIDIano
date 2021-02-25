import { getSetting } from "../settings/Settings.js"
import {
	createCompleteGainNode,
	createContinuousGainNode
} from "./GainNodeController.js"

class AudioNote {
	constructor(context, buffer) {
		this.source = context.createBufferSource()
		this.source.buffer = buffer
	}

	connectSource(context, gainNode) {
		this.source.connect(gainNode)
		this.getGainNode().connect(context.destination)
	}
	getGainNode() {
		return this.gainNodeController.gainNode
	}
	suspend() {
		this.source.stop(0)
	}
	play(time) {
		this.source.start(time)
	}
	endAt(time, isSustained) {
		let endTime = this.gainNodeController.endAt(time, isSustained)
		this.endSourceAt(endTime + 0.5)
	}
	endSourceAt(time) {
		this.source.stop(time)
	}
}

export const createContinuousAudioNote = (context, buffer, volume) => {
	let audioNote = new AudioNote(context, buffer)

	audioNote.gainNodeController = createContinuousGainNode(
		context,
		context.currentTime,
		volume
	)

	audioNote.connectSource(context, audioNote.gainNodeController.gainNode)
	audioNote.play(context.currentTime)
	return audioNote
}

export const createCompleteAudioNote = (
	note,
	currentSongTime,
	playbackSpeed,
	volume,
	isPlayalong,
	context,
	buffer
) => {
	let audioNote = new AudioNote(context, buffer)
	const gainValue = getNoteGain(note, volume)
	if (gainValue == 0) {
		return audioNote
	}

	let contextTimes = getContextTimesForNote(
		context,
		note,
		currentSongTime,
		playbackSpeed,
		isPlayalong
	)
	const isSustained = contextTimes.end < contextTimes.sustainOff

	audioNote.gainNodeController = createCompleteGainNode(
		context,
		gainValue,
		contextTimes,
		isSustained
	)

	audioNote.connectSource(context, audioNote.getGainNode())

	audioNote.play(contextTimes.start)
	audioNote.endAt(
		isSustained ? contextTimes.sustainOff : contextTimes.end,
		isSustained
	)

	return audioNote
}

function getContextTimesForNote(
	context,
	note,
	currentSongTime,
	playbackSpeed,
	isPlayAlong
) {
	let delayUntilNote = (note.timestamp / 1000 - currentSongTime) / playbackSpeed
	let delayCorrection = 0
	if (isPlayAlong) {
		delayCorrection = getPlayalongDelayCorrection(delayUntilNote)
		delayUntilNote = Math.max(0, delayUntilNote)
	}
	let start = context.currentTime + delayUntilNote

	let end = start + note.duration / 1000 / playbackSpeed + delayCorrection

	let sustainOff = start + note.sustainDuration / 1000 / playbackSpeed
	return { start, end, sustainOff }
}

function getPlayalongDelayCorrection(delayUntilNote) {
	let delayCorrection = 0
	if (delayUntilNote < 0) {
		console.log("negative delay")
		delayCorrection = -1 * (delayUntilNote - 0.1)
		delayUntilNote = 0.1
	}

	return delayCorrection
}

function getNoteGain(note, volume) {
	let gain = 2 * (note.velocity / 127) * volume

	let clampedGain = Math.min(10.0, Math.max(-1.0, gain))
	return clampedGain
}
