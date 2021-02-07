import { CONST } from "../data/CONST.js"

/**
 *
 */

var theTracks = {}
export const getTracks = () => {
	return theTracks
}
export const getTrack = trackId => {
	return theTracks[trackId]
}
export const setupTracks = activeTracks => {
	theTracks = {}
	for (let trackId in activeTracks) {
		if (!theTracks.hasOwnProperty(trackId)) {
			theTracks[trackId] = {
				draw: true,
				color: CONST.TRACK_COLORS[trackId % 4],
				volume: 100,
				name: activeTracks[trackId].name || "Track " + trackId,
				requiredToPlay: false,
				index: trackId
			}
		}
		theTracks[trackId].color = CONST.TRACK_COLORS[trackId % 4]
	}
}

export const isTrackRequiredToPlay = trackId => {
	return theTracks[trackId].requiredToPlay
}

export const isAnyTrackPlayalong = () => {
	return (
		Object.keys(theTracks).filter(trackId => theTracks[trackId].requiredToPlay)
			.length > 0
	)
}

export const getTrackVolume = trackId => {
	return theTracks[trackId].volume
}

export const isTrackDrawn = trackId => {
	return theTracks[trackId] && theTracks[trackId].draw
}

export const getTrackColor = trackId => {
	return theTracks[trackId] ? theTracks[trackId].color : "rgba(0,0,0,0)"
}

export const setTrackColor = (trackId, colorId, color) => {
	theTracks[trackId].color[colorId] = color
}
