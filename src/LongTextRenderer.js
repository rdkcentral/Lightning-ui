import Lightning from '@lightningjs/core';
import ScrollBar from './ScrollBar'
import List from './List'

export default class LongTextRenderer extends Lightning.Component {
  static _template() {
    return {
      w: w => w,
      h: h => h,
      TextArea: {
        w: w => w,
        h: h => h,
        clipping: true,
        Description: {
          w: w => w,
          type: List,
          direction: 'column',
        },
      },
      ScrollBar: {
        alpha: 0,
        w: 10,
        h: h => h,
        type: ScrollBar,
        signals: { scrollTo: true },
      },
    }
  }

  _init() {
    this._descriptionVisibleHeight = this.h ? this.h : this.defaultTextAreaHeight
    this._textTextureDefaults = new Lightning.textures.TextTexture(this.stage).cloneArgs()
    this._isScrollBarEnabled = false
  }

  set scrollBarProps(obj) {
    this._scrollBarProps = obj
    this.tag('ScrollBar').patch({
      ...obj,
    })
  }

  get scrollBarProps() {
    return this._scrollBarProps
  }

  set scrollPercentage(val) {
    this._scrollPercentage = val / 100
  }

  get scrollPercentage() {
    //default scrolling of 80% of the view every time
    return this._scrollPercentage ? this._scrollPercentage : 0.8
  }

  set textProps(obj) {
    this._textProps = obj
  }

  get textProps() {
    return this._textProps ? this._textProps : this.defaultTextProps
  }

  get defaultTextAreaHeight() {
    return 1000
  }

  get defaultTextProps() {
    return {
      textAlign: 'left',
      fontFace: 'Roboto',
      fontSize: 22,
      lineHeight: 40,
      wordWrapWidth: 1000,
      textColor: 0xff606060,
    }
  }

  get isScrollBarEnabled() {
    return this._isScrollBarEnabled
  }

  set description(description) {
    this._description = description
    let lineHeight = this.textProps.lineHeight

    const { lines, height } = Lightning.textures.TextTexture.renderer(
        this.stage,
        this.stage.platform.getDrawingCanvas(),
        this._createParagraph(description)
    )._calculateRenderInfo()

    this._descriptionTotalHeight = height || this.h
    let textItems = lines.map(line => {
      return {
        w: this.w ? this.w : 1000,
        h: lineHeight,
        type: TextComponent,
        item: {
          ...this.textProps,
          text: line,
        },
      }
    })

    this.tag('Description').reload(textItems)
    if (this._descriptionTotalHeight > this._descriptionVisibleHeight) {
      this.tag('ScrollBar').setSmooth('alpha', 1)
      this._isScrollBarEnabled = true
      //number of scrolls possible with scrolling of scrollPercentage of the view every time
      this._totalScrollBarSteps = this._descriptionTotalHeight / (this.scrollPercentage * this._descriptionVisibleHeight)
      this.tag('ScrollBar').totalNumOfScrolls = this._totalScrollBarSteps
    }
  }

  get description() {
    return this._description
  }

  _createParagraph(text) {
    return {
      ...this._textTextureDefaults,
      ...this.textProps,
      text: text,
    }
  }

  _getFocused() {
    if (this.isScrollBarEnabled) {
      return this.tag('ScrollBar')
    }
    return this
  }

  scrollTo(scrollerPosition) {
    const viewYPos = Math.floor(this._descriptionVisibleHeight / this._totalScrollBarSteps) * scrollerPosition * -1
    this.tag('Description').patch({ smooth: { y: viewYPos ? viewYPos : 0 } })
  }

  reset() {
    this.tag('Description').clear()
    this._description = ""
  }
}

class TextComponent extends Lightning.Component {
  static _template() {
    return {
      Text: {
        text: {},
      },
    }
  }

  set item(textProps) {
    let updateProps = {
      x: 0,
      mountX: 0
    }
    if (textProps.textAlign && textProps.textAlign === 'right') {
      updateProps = {
        x: textProps.wordWrapWidth || this.w,
        mountX: 1,
      }
    }
    this.tag('Text').patch({
      ...updateProps,
      text: {
        ...textProps
      }
    })
  }
}
