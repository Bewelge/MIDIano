function formatTime(seconds, showMilis) {
	seconds = Math.max(seconds, 0)
	let date = new Date(seconds * 1000)
	let timeStrLength = showMilis ? 11 : 8
	try {
		let timeStr = date.toISOString().substr(11, timeStrLength)
		if (timeStr.substr(0, 2) == "00") {
			timeStr = timeStr.substr(3)
		}
		return timeStr
	} catch (e) {
		console.error(e)
		//ignore this. only seems to happend when messing with breakpoints in devtools
	}
}
/**
 *  Checks whether a note Number corresponds to a black piano key
 * @param {Number} noteNumber
 */
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
function drawRoundRect(ctx, x, y, width, height, radius, isRounded) {
	// radius = radius * 2 < ( Math.min( height, width ) ) ? radius : ( Math.min( height, width ) ) / 2
	if (typeof radius === "undefined") {
		radius = 0
	}
	if (typeof radius === "number") {
		radius = Math.min(radius, Math.min(width / 2, height / 2))
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
	if (!isRounded) {
		ctx.moveTo(x + radius.tl, y)
		ctx.lineTo(x + width - radius.tr, y)
		ctx.lineTo(x + width, y + radius.tr)
		ctx.lineTo(x + width, y + height - radius.br)
		ctx.lineTo(x + width - radius.br, y + height)
		ctx.lineTo(x + radius.bl, y + height)
		ctx.lineTo(x, y + height - radius.bl)
		ctx.lineTo(x, y + radius.tl)
		ctx.lineTo(x + radius.tl, y)
	} else {
		ctx.moveTo(x + radius.tl, y)
		ctx.lineTo(x + width - radius.tr, y)
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
		ctx.lineTo(x + width, y + height - radius.br)
		ctx.quadraticCurveTo(
			x + width,
			y + height,
			x + width - radius.br,
			y + height
		)
		ctx.lineTo(x + radius.bl, y + height)
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
		ctx.lineTo(x, y + radius.tl)
		ctx.quadraticCurveTo(x, y, x + radius.tl, y)
	}
	ctx.closePath()
}

function replaceAllString(text, replaceThis, withThat) {
	return text.replace(new RegExp(replaceThis, "g"), withThat)
}

function groupArrayBy(arr, keyFunc) {
	let keys = {}
	arr.forEach(el => (keys[keyFunc(el)] = []))
	Object.keys(keys).forEach(key => {
		arr.forEach(el => (keyFunc(el) == key ? keys[keyFunc(el)].push(el) : null))
	})
	return keys
}
function loadJson(url, callback) {
	let request = new XMLHttpRequest()
	request.overrideMimeType("application/json")
	request.open("GET", url, true)
	request.onreadystatechange = function () {
		if (request.readyState == 4 && request.status == "200") {
			callback(request.responseText)
		}
	}
	request.send(null)
}

function iOS() {
	return (
		[
			"iPad Simulator",
			"iPhone Simulator",
			"iPod Simulator",
			"iPad",
			"iPhone",
			"iPod"
		].includes(navigator.platform) ||
		// iPad on iOS 13 detection
		(navigator.userAgent.includes("Mac") && "ontouchend" in document)
	)
}

export {
	formatTime,
	isBlack,
	sum,
	drawRoundRect,
	replaceAllString,
	groupArrayBy,
	loadJson,
	iOS
}
