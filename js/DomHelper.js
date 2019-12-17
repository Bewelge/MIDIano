class DomHelper {
    static createCanvas(width, height, styles) {
        return DomHelper.createElement('canvas',styles, {
            width:width,
            height:height
        })
    }
    static createSpinner() {
        return DomHelper.createDivWithIdAndClass("loadSpinner","loader")
    }
    static setCanvasSize(cnv, width, height) {
        cnv.width = width
        cnv.height = height
    }
    static replaceGlyph(element,oldIcon,newIcon) {
        element.className = element.className.replace('glyphicon-' +oldIcon,'glyphicon-' + newIcon)
    }
    static createSliderWithLabel(id,label,val,min,max,onChange) {
        let cont = DomHelper.createElement('div',{},{id: id + 'container', className:'sliderContainer'})
        let labelDiv = DomHelper.createElement('div',{},{id:id + 'label', className:'sliderLabel',innerHTML: label})
        let slider = DomHelper.createSlider(id,val,min,max,onChange)
        cont.appendChild(labelDiv)
        cont.appendChild(slider)
        return {slider:slider,container:cont}
    }
    static createGlyphiconButton(id,glyph,onClick) {
        let bt = DomHelper.createButton(id,onClick) 
        bt.appendChild(this.getGlyphicon(glyph))
        return bt
    }
    static createGlyphiconTextButton(id,glyph,text,onClick) {
        let bt = DomHelper.createButton(id,onClick) 
        bt.appendChild(this.getGlyphicon(glyph))
        bt.innerHTML += " " + text
        return bt
    }
    static createDiv(styles,attributes) {
        return DomHelper.createElement("div",styles,attributes)
    }
    static createDivWithId(id,styles,attributes) {
        attributes = attributes || {}
        attributes.id = id
        return  DomHelper.createElement('div',styles,attributes)
    }
    static createDivWithClass(className,styles,attributes) {
        attributes = attributes || {}
        attributes.className = className
         return DomHelper.createElement('div',styles,attributes)
    }
    static createDivWithIdAndClass(id,className,styles,attributes) {
        attributes = attributes || {}
        attributes.id = id
        attributes.className = className
        return  DomHelper.createElement('div',styles,attributes)
    }
    static createElementWithId(id,tag,styles,attributes) {
        attributes = attributes || {}
        attributes.id = id
        return DomHelper.createElement(tag,styles,attributes)
    }
    static createElementWithClass(className,tag,styles,attributes) {
        attributes = attributes || {}
        attributes.className = className
        return DomHelper.createElement(tag,styles,attributes)
    }
    static createElementWithIdAndClass(id,className,tag,styles,attributes) {
        attributes = attributes || {}
        attributes.id = id
        attributes.className = className
       return  DomHelper.createElement(tag,styles,attributes)
    }
    static getGlyphicon(name) {
        return DomHelper.createElement('span',{},{className:'glyphicon glyphicon-'+name})
    }
    static createSlider(id,val,min,max,onChange) {
        return DomHelper.createElement('input',{},{
            id:id,
            oninput: onChange, 
            type:'range',
            value:val,
            min:min,
            max:max
        })
    }
    static createTextInput(onChange,styles,attributes) {
        attributes.onchange = onChange
        return DomHelper.createElement('input',styles,attributes) 
    }
    static addClassToElements(className,elements) {
        elements.forEach(element=>DomHelper.addClassToElement(className, element))
    }
    static addClassToElement(className,element) {
        element.className += ' ' + className
    }
    static createFlexContainer() {
        return DomHelper.createElement("div", {}, {className:'flexContainer'})
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
     return vertical ? 
            DomHelper.createElement('div',{justifyContent:'space-around'},{className:'btn-group btn-group-vertical',role:'group'})
            : DomHelper.createElement('div',{justifyContent:'space-around'},{className:'btn-group',role:'group'})
        
    }
    static createFileInput(text,callback) {
        let customFile = DomHelper.createElement('label',{},{className:'btn btn-default btn-file'})
        customFile.appendChild(DomHelper.getGlyphicon('folder-open'))
        customFile.innerHTML += ' ' + text
        let inp = DomHelper.createElement('input',{display:'none'},{type:'file'})

        customFile.appendChild(inp)
        inp.onchange  = callback
      
        return customFile
    }
    static getDivider() {
        return DomHelper.createElement('div',{},{className:"divider"})
    }
    static createButton(id,onClick) {
        return DomHelper.createElement('button',{},{
            id:id,
            type:'button',
            className:'btn btn-default',
            onclick: onClick
        })
    }
    static createElement(tag,styles,attributes) {
        tag = tag || 'div'
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
}