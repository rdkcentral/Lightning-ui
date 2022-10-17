import Lightning from '@lightningjs/core';

export default class Scrollbar extends Lightning.Component {
  constructor(stage) {
    super(stage)
    this._direction = 'vertical'
    this._colors = {
      background: 0xff000000,
      scrollerFocused: 0xff00a7e3,
      scrollerUnfocused: 0x99ffffff,
    }
  }

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

  _init() {
    this._setState('Inactive')
  }

  /**
   * Set the scroll bar direction.
   * @param v vertical or horizontal
   */
  set direction(v) {
    this._direction = v
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

  /**
   * Set the view sizes to which you want to apply scrolling.
   * @param visible view visible size
   * @param total view total size
   */
  set sizes({ visible, total }) {
    this._visibleSize = visible
    this._totalScrollSize = total

    //current scroller position
    this._scrollerPosition = 0

    //number of scrolls possible with scrolling only 80% of the view every time
    this._totoalScrolls = this._totalScrollSize / (0.8 * this._visibleSize)

    //scroller height
    this._scrollerSize = this._scrollbarTotalSize / this._totoalScrolls

    let scrollerSizeProperty = this._direction === 'vertical' ? 'h' : 'w'
    this.tag('Scroller').patch({ smooth: { [scrollerSizeProperty]: this._scrollerSize } })

    this._apply()
  }

  get _scrollbarTotalSize() {
    return this.tag('Background')[this._direction === 'vertical' ? 'finalH' : 'finalW']
  }

  get _scrollbarStart() {
    return this.tag('Background')[this._direction === 'vertical' ? 'finalY' : 'finalX']
  }

  get _scrollerStartPosition() {
    return this._scrollbarStart + this._scrollerPosition * this._scrollerSize
  }

  get _viewStartPosition() {
    return Math.floor(this._totalScrollSize / this._totoalScrolls) * this._scrollerPosition * -1
  }

  get _axis() {
    return this._direction === 'vertical' ? 'y' : 'x'
  }

  _handleNext() {
    let scrollerPosition = this._scrollerPosition
    if (this._scrollerPosition < this._totoalScrolls - 1) {
      scrollerPosition++
      if (scrollerPosition > this._totoalScrolls - 1) {
        scrollerPosition = scrollerPosition - (scrollerPosition - (this._totoalScrolls - 1))
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

  _apply() {
    let scrollerStart = this._scrollerStartPosition
    let viewStart = this._viewStartPosition
    let axis = this._axis

    this.tag('Scroller').patch({ smooth: { [axis]: scrollerStart } })
    this.signal('scrollTo', viewStart)
  }

  static _states() {
    return [
      class Inactive extends this {
        $enter() {
          this.patch({
            Scroller: { color: this._colors.scrollerUnfocused },
          })
        }

        _focus() {
          this._setState('Active')
        }
      },
      class Active extends this {
        $enter() {
          this.patch({
            Scroller: { color: this._colors.scrollerFocused },
          })
        }

        _unfocus() {
          this._scrollerPosition = 0
          this._apply()
          this._setState('Inactive')
        }

        _handleDown() {
          if (this._direction === 'vertical') {
            return this._handleNext()
          } else {
            return false
          }
        }

        _handleUp() {
          if (this._direction === 'vertical') {
            return this._handlePrevious()
          } else {
            return false
          }
        }

        _handleRight() {
          if (this._direction !== 'vertical') {
            return this._handleNext()
          } else {
            return false
          }
        }

        _handleLeft() {
          if (this._direction !== 'vertical') {
            return this._handlePrevious()
          } else {
            return false
          }
        }
      },
    ]
  }
}
