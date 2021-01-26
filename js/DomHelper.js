import { replaceAllString } from "./Util.js"

export class DomHelper {
	static createCanvas(width, height, styles) {
		return DomHelper.createElement("canvas", styles, {
			width: width,
			height: height
		})
	}
	static createSpinner() {
		return DomHelper.createDivWithIdAndClass("loadSpinner", "loader")
	}
	static setCanvasSize(cnv, width, height) {
		cnv.width = width
		cnv.height = height
	}
	static replaceGlyph(element, oldIcon, newIcon) {
		element.children.forEach(childNode => {
			if (childNode.classList.contains("glyphicon-" + oldIcon)) {
				childNode.className = childNode.className.replace(
					"glyphicon-" + oldIcon,
					"glyphicon-" + newIcon
				)
			}
		})
	}
	static removeClass(className, element) {
		element.className = element.className.replace(className, "")
	}
	static createSliderWithLabel(id, label, val, min, max, step, onChange) {
		let cont = DomHelper.createElement(
			"div",
			{},
			{ id: id + "container", className: "sliderContainer" }
		)
		let labelDiv = DomHelper.createElement(
			"label",
			{},
			{ id: id + "label", className: "sliderLabel", innerHTML: label }
		)
		let slider = DomHelper.createSlider(id, val, min, max, step, onChange)
		cont.appendChild(labelDiv)
		cont.appendChild(slider)
		return { slider: slider, container: cont }
	}
	static createSliderWithLabelAndField(
		id,
		label,
		val,
		min,
		max,
		step,
		onChange
	) {
		let displayDiv = DomHelper.createElement(
			"div",
			{},
			{ id: id + "Field", className: "sliderVal", innerHTML: val }
		)

		let onChangeInternal = ev => {
			displayDiv.innerHTML = ev.target.value
			onChange(ev.target.value)
		}

		let cont = DomHelper.createElement(
			"div",
			{},
			{ id: id + "container", className: "sliderContainer" }
		)
		let labelDiv = DomHelper.createElement(
			"label",
			{},
			{ id: id + "label", className: "sliderLabel", innerHTML: label }
		)
		let slider = DomHelper.createSlider(
			id,
			val,
			min,
			max,
			step,
			onChangeInternal
		)
		cont.appendChild(labelDiv)
		cont.appendChild(displayDiv)
		cont.appendChild(slider)

		return { slider: slider, container: cont }
	}
	static createGlyphiconButton(id, glyph, onClick) {
		let bt = DomHelper.createButton(id, onClick)
		bt.appendChild(this.getGlyphicon(glyph))
		return bt
	}
	static createGlyphiconTextButton(id, glyph, text, onClick) {
		let bt = DomHelper.createButton(id, onClick)
		bt.appendChild(this.getGlyphicon(glyph))
		bt.innerHTML += " " + text
		return bt
	}
	static createDiv(styles, attributes) {
		return DomHelper.createElement("div", styles, attributes)
	}
	static createDivWithId(id, styles, attributes) {
		attributes = attributes || {}
		attributes.id = id
		return DomHelper.createElement("div", styles, attributes)
	}
	static createDivWithClass(className, styles, attributes) {
		attributes = attributes || {}
		attributes.className = className
		return DomHelper.createElement("div", styles, attributes)
	}
	static createDivWithIdAndClass(id, className, styles, attributes) {
		attributes = attributes || {}
		attributes.id = id
		attributes.className = className
		return DomHelper.createElement("div", styles, attributes)
	}
	static createElementWithId(id, tag, styles, attributes) {
		attributes = attributes || {}
		attributes.id = id
		return DomHelper.createElement(tag, styles, attributes)
	}
	static createElementWithClass(className, tag, styles, attributes) {
		attributes = attributes || {}
		attributes.className = className
		return DomHelper.createElement(tag, styles, attributes)
	}
	static createElementWithIdAndClass(id, className, tag, styles, attributes) {
		styles = styles || {}
		attributes = attributes || {}
		attributes.id = id
		attributes.className = className
		return DomHelper.createElement(tag, styles, attributes)
	}
	static getGlyphicon(name) {
		return DomHelper.createElement(
			"span",
			{},
			{ className: "glyphicon glyphicon-" + name }
		)
	}
	static createSlider(id, val, min, max, step, onChange) {
		return DomHelper.createElement(
			"input",
			{},
			{
				id: id,
				oninput: onChange,
				type: "range",
				value: val,
				min: min,
				max: max,
				step: step
			}
		)
	}
	static createTextInput(onChange, styles, attributes) {
		attributes = attributes || {}
		attributes.type = "text"
		attributes.onchange = onChange
		return DomHelper.createElement("input", styles, attributes)
	}
	static createCheckbox(text, onChange, value) {
		let id = replaceAllString(text, " ", "") + "checkbox"
		let cont = DomHelper.createDivWithIdAndClass(id, "checkboxCont")
		let checkbox = DomHelper.createElementWithClass("checkboxInput", "input")
		checkbox.setAttribute("type", "checkbox")
		checkbox.checked = value
		checkbox.setAttribute("name", id)
		checkbox.onchange = onChange

		let label = DomHelper.createElementWithClass(
			"checkboxlabel",
			"label",
			{},
			{ innerHTML: text, for: id }
		)

		label.setAttribute("for", id)

		cont.appendChild(checkbox)
		cont.appendChild(label)
		cont.addEventListener("click", ev => {
			if (ev.target != checkbox) {
				checkbox.click()
			}
		})
		return cont
	}
	static addClassToElements(className, elements) {
		elements.forEach(element => DomHelper.addClassToElement(className, element))
	}
	static addClassToElement(className, element) {
		if (!element.classList.contains(className)) {
			element.className += " " + className
		}
	}
	static createFlexContainer() {
		return DomHelper.createElement("div", {}, { className: "flexContainer" })
	}
	static addToFlexContainer(el) {
		let cont = DomHelper.createFlexContainer()
		cont.appendChild(el)
		return cont
	}
	static appendChildren(parent, children) {
		children.forEach(child => parent.appendChild(child))
	}
	static createButtonGroup(vertical) {
		return vertical
			? DomHelper.createElement(
					"div",
					{ justifyContent: "space-around" },
					{ className: "btn-group btn-group-vertical", role: "group" }
			  )
			: DomHelper.createElement(
					"div",
					{ justifyContent: "space-around" },
					{ className: "btn-group", role: "group" }
			  )
	}
	static createFileInput(text, callback) {
		let customFile = DomHelper.createElement(
			"label",
			{},
			{ className: "btn btn-default btn-file" }
		)
		customFile.appendChild(DomHelper.getGlyphicon("folder-open"))
		customFile.innerHTML += " " + text
		let inp = DomHelper.createElement(
			"input",
			{ display: "none" },
			{ type: "file" }
		)

		customFile.appendChild(inp)
		inp.onchange = callback

		return customFile
	}
	static getDivider() {
		return DomHelper.createElement("div", {}, { className: "divider" })
	}
	static createButton(id, onClick) {
		let bt = DomHelper.createElement(
			"button",
			{},
			{
				id: id,
				type: "button",
				className: "btn btn-default",
				onclick: onClick
			}
		)
		bt.appendChild(DomHelper.getButtonSelectLine())
		return bt
	}
	static createTextButton(id, text, onClick) {
		let bt = DomHelper.createElement(
			"button",
			{},
			{
				id: id,
				type: "button",
				className: "btn btn-default",
				onclick: onClick,
				innerHTML: text
			}
		)
		bt.appendChild(DomHelper.getButtonSelectLine())
		return bt
	}
	static getButtonSelectLine() {
		return DomHelper.createDivWithClass("btn-select-line")
	}
	static createElement(tag, styles, attributes) {
		tag = tag || "div"
		attributes = attributes || {}
		styles = styles || {}
		let el = document.createElement(tag)
		Object.keys(attributes).forEach(attr => {
			el[attr] = attributes[attr]
		})
		Object.keys(styles).forEach(style => {
			el.style[style] = styles[style]
		})
		return el
	}

	static createInputSelect(title, items, callback) {
		let selectBox = DomHelper.createDivWithId(title)
		let label = DomHelper.createElementWithClass(
			"inputSelectLabel",
			"label",
			{},
			{ innerHTML: title }
		)
		selectBox.appendChild(label)
		let selectTag = DomHelper.createElementWithIdAndClass(
			title,
			"inputSelect",
			"select"
		)
		selectBox.appendChild(selectTag)
		items.forEach((item, index) => {
			let option = DomHelper.createElement(
				"option",
				{},
				{
					value: item,
					innerHTML: item
				}
			)
			selectTag.appendChild(option)
		})
		selectBox.addEventListener("change", ev => {
			callback(selectTag.value)
		})
		return selectBox
	}
}
