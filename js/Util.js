function formatTime(seconds) {
	seconds = Math.max(seconds, 0)
	let date = new Date(seconds * 1000)
	return date.toISOString().substr(11, 8)
}
function isBlack(noteNumber) {
	return (noteNumber + 11) % 12 == 0 ||
		(noteNumber + 8) % 12 == 0 ||
		(noteNumber + 6) % 12 == 0 ||
		(noteNumber + 3) % 12 == 0 ||
		(noteNumber + 1) % 12 == 0
		? 1
		: 0
}
export { formatTime, isBlack }
