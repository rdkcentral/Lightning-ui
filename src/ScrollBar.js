import Lightning from '@lightningjs/core';

export default class ScrollBar extends Lightning.Component {
  static _template() {
    return {
      Background: {
        h: h => h,
        w: w => w,
        rect: true,
        color: 0xffd8d8d8,
      },
      Scroller: {
        h: h => h,
        w: w => w,
        rect: true,
      },
    }
  }

  _construct() {
    this._direction = ScrollBar.DIRECTION.vertical
    this._colors = {
      background: 0xffd8d8d8,
      scrollerFocused: 0xff00a7e3,
      scrollerUnfocused: 0xff606060,
    }
  }

  _init() {
    this.patch({
      Scroller: { color: this._colors.scrollerUnfocused },
    })
  }

  _focus() {
    this.patch({
      Scroller: { color: this._colors.scrollerFocused },
    })
  }

  _unfocus() {
    this._scrollerPosition = 0
    this._apply()
    this.patch({
      Scroller: { color: this._colors.scrollerUnfocused },
    })
  }

  /**
   * Set the scroll bar direction.
   * @param string vertical or horizontal
   */
  set direction(string) {
    this._direction = ScrollBar.DIRECTION[string] || ScrollBar.DIRECTION.vertical;
  }

  get direction() {
    return this._direction
  }

  /**
   * Set the required colors for the scroll bar.
   * @param background scroll bar color
   * @param scrollerFocused scroller color when focused
   * @param scrollerUnfocused scroller color when it is out of focus
   */
  set colors({ background = null, scrollerFocused = null, scrollerUnfocused = null }) {
    this._colors.background = background || this._colors.background
    this._colors.scrollerFocused = scrollerFocused || this._colors.scrollerFocused
    this._colors.scrollerUnfocused = scrollerUnfocused || this._colors.scrollerUnfocused

    this.tag('Background').patch({ color: this._colors.background })
  }

  get colors() {
    return this._colors
  }

  /**
   * Set the possible number of scrolls.
   * @param val number of scrolls available
   */
  set totalNumOfScrolls(val) {
    //current scroller position
    this._scrollerPosition = 0
    this._totalScrolls = val

    //scroller height
    this._scrollerSize = this._scrollbarTotalSize / this._totalScrolls

    let scrollerSizeProperty = this.direction === 'vertical' ? 'h' : 'w'
    this.tag('Scroller').patch({ smooth: { [scrollerSizeProperty]: this._scrollerSize } })

    this._apply()
  }

  get totalNumOfScrolls() {
    return this._totalScrolls
  }

  get _scrollbarTotalSize() {
    return this.direction === 'vertical' ? this.h : this.w
  }

  get _scrollbarStart() {
    return this.tag('Background')[this.direction === 'vertical' ? 'finalY' : 'finalX']
  }

  get _scrollerStartPosition() {
    return this._scrollbarStart + this._scrollerPosition * this._scrollerSize
  }

  get _axis() {
    return this.direction === 'vertical' ? 'y' : 'x'
  }

  _handleNext() {
    let scrollerPosition = this._scrollerPosition
    if (this._scrollerPosition < this._totalScrolls - 1) {
      scrollerPosition++
      if (scrollerPosition > this._totalScrolls - 1) {
        scrollerPosition = scrollerPosition - (scrollerPosition - (this._totalScrolls - 1))
      }
      this._scrollerPosition = scrollerPosition
      this._apply()
    } else {
      return false
    }
  }

  _handlePrevious() {
    if (this._scrollerPosition > 0) {
      this._scrollerPosition--
      this._scrollerPosition = this._scrollerPosition < 0 ? 0 : this._scrollerPosition
      this._apply()
    } else {
      return false
    }
  }

  _handleDown() {
    if (this.direction === 'vertical') {
      return this._handleNext()
    } else {
      return false
    }
  }

  _handleUp() {
    if (this.direction === 'vertical') {
      return this._handlePrevious()
    } else {
      return false
    }
  }

  _handleRight() {
    if (this.direction === 'horizontal') {
      return this._handleNext()
    } else {
      return false
    }
  }

  _handleLeft() {
    if (this.direction === 'horizontal') {
      return this._handlePrevious()
    } else {
      return false
    }
  }

  _apply() {
    let scrollerStart = this._scrollerStartPosition
    let axis = this._axis

    this.tag('Scroller').patch({ smooth: { [axis]: scrollerStart } })
    this.signal('scrollTo', this._scrollerPosition)
  }
}

ScrollBar.DIRECTION = {
  vertical: 'vertical',
  horizontal: 'horizontal'
}