/**
 * true if the piano-key corresponding to noteNumber is a black key
 * @param {Number} noteNumber
 */
export function isBlack(noteNumber) {
	return (noteNumber + 11) % 12 == 0 ||
		(noteNumber + 8) % 12 == 0 ||
		(noteNumber + 6) % 12 == 0 ||
		(noteNumber + 3) % 12 == 0 ||
		(noteNumber + 1) % 12 == 0
		? 1
		: 0
}
