import Lightning from '@lightningjs/core';
import Scrollbar from './Scrollbar'
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
      Scrollbar: {
        w: 10,
        h: h => h,
        type: Scrollbar,
        signals: { scrollTo: true },
      },
    }
  }

  set scrollBarProps(obj) {
    this.tag('Scrollbar').patch({
      ...obj,
    })
  }

  set textProps(obj) {
    this._textProps = obj
  }

  get _defaultTextAreaHeight() {
    return 900
  }

  get _defaultTextProps() {
    return {
      textAlign: 'left',
      fontFace: 'Roboto',
      fontSize: 22,
      lineHeight: 40,
      wordWrapWidth: 1500,
      textColor: 0xff606060,
    }
  }

  _setScrollerSizes() {
    this.tag('Scrollbar').sizes = {
      visible: this._descriptionVisibleHeight,
      total: this._descriptionTotalHeight,
    }
  }

  set setDescription(description) {
    this._descriptionVisibleHeight = this.h ? this.h : this._defaultTextAreaHeight
    this._textTextureDefaults = new Lightning.textures.TextTexture(this.stage).cloneArgs()
    this._textProps = this._textProps ? this._textProps : this._defaultTextProps
    let lineHeight = this._textProps.lineHeight || this._defaultTextProps.lineHeight

    const info = Lightning.textures.TextTexture.renderer(
      this.stage,
      this.stage.platform.getDrawingCanvas(),
      this._createParagraph(description)
    )._calculateRenderInfo()

    let textItems = info.lines.map(line => {
      return {
        w: this.w ? this.w : 1000,
        h: lineHeight,
        type: TextComponent,
        item: {
          ...this._textProps,
          text: line,
        },
      }
    })

    this._descriptionTotalHeight = info.lines.length ? info.lines.length * lineHeight : this.h
    this.tag('Description').reload(textItems)
  }

  _focus() {
    this._setScrollerSizes()
    this._setState('Active')
  }

  _createParagraph(text) {
    return {
      ...this._textTextureDefaults,
      ...this._textProps,
      text: text,
    }
  }

  static _states() {
    return [
      class Active extends this {
        _getFocused() {
          return this.tag('Scrollbar')
        }

        scrollTo(position) {
          this.tag('Description').patch({ smooth: { y: position ? position : 0 } })
        }
      },
    ]
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
