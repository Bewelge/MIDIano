function formatTime(seconds) {
	seconds = Math.max(seconds, 0)
	let date = new Date(seconds * 1000)
	try {
		return date.toISOString().substr(11, 8)
	} catch (e) {
		console.error(e)
		//ignore this. only seems to happend when messing with breakpoints in devtools
	}
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
function sum(arr) {
	return arr.reduce((previousVal, currentVal) => previousVal + currentVal)
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @param {Number} radius
 */
function drawRoundRect(ctx, x, y, width, height, radius) {
	// radius = radius * 2 < ( Math.min( height, width ) ) ? radius : ( Math.min( height, width ) ) / 2
	if (typeof radius === "undefined") {
		radius = 0
	}
	if (typeof radius === "number") {
		radius = {
			tl: radius,
			tr: radius,
			br: radius,
			bl: radius
		}
	} else {
		var defaultRadius = {
			tl: 0,
			tr: 0,
			br: 0,
			bl: 0
		}
		for (var side in defaultRadius) {
			radius[side] = radius[side] || defaultRadius[side]
		}
	}

	ctx.beginPath()
	ctx.moveTo(x + radius.tl, y)
	ctx.lineTo(x + width - radius.tr, y)
	ctx.lineTo(x + width, y + radius.tr)
	ctx.lineTo(x + width, y + height - radius.br)
	ctx.lineTo(x + width - radius.br, y + height)
	ctx.lineTo(x + radius.bl, y + height)
	ctx.lineTo(x, y + height - radius.bl)
	ctx.lineTo(x, y + radius.tl)
	ctx.lineTo(x + radius.tl, y)

	ctx.closePath()
}
export { formatTime, isBlack, sum, drawRoundRect }
