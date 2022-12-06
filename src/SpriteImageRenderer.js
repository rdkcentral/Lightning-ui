/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2021 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Lightning from '@lightningjs/core';
import { Utils } from '@lightningjs/sdk';

export default class SpriteImageRenderer extends Lightning.Component {
  static _template() {
    return {
      Sprite: { src: undefined },
    }
  }

  _init() {
    this._index = 0
    this._totalLoops = -1
    this._totalLoopsDone = 0
    this._xJumpInPixels = 0
    this._yJumpInPixels = 0
    this._loopIsRunning = false

    this.tag('Sprite').on('txLoaded', () => {
      this._xJumpInPixels = this.tag('Sprite').finalW / this._totalColumns
      this._yJumpInPixels = this.tag('Sprite').finalH / this._totalRows
      this.patch({ w: this._xJumpInPixels, h: this._yJumpInPixels, clipping: true })
    })

    this.stage.on('frameStart', () => {
      if (this._loopIsRunning) {
        if (this.stage.frameCounter % (60 / this._fps) === 0) {
          this._updateSpritePosition()
        }
      }
    })
  }

  // spriteSheet: spriteSheet location
  set spriteSheet(image) {
    this.tag('Sprite').src = Utils.asset(image)
  }
  get spriteSheet() {
    return this.tag('Sprite').src
  }

  // totalColumns: total columns of spriteSheet
  set columns(columns) {
    this._totalColumns = columns
  }
  get columns() {
    return this._totalColumns
  }

  // totalRows: total rows of spriteSheet
  set rows(rows) {
    this._totalRows = rows
  }
  get rows() {
    return this._totalRows
  }

  // spriteAnimationSets: Object with animations {  start: startFrame, end: endFrame, repeat: (-1 equals infinite) }
  set spriteAnimationSets(spriteAnimationSets) {
    this._spriteAnimationSets = spriteAnimationSets
  }
  
  get spriteAnimationSets() {
    return this._spriteAnimationSets
  }

  // fps: frames per second ( 0 to 60 )
  set fps(fps) {
    this._fps = Math.min(60, Math.max(0, fps))
  }
  get fps() {
    return this._fps
  }

  // Stop sprite animation instantaneous
  stop() {
    this._loopIsRunning = false
  }
  resume() {
    this._loopIsRunning = true
  }
  _reset() {
    this._index = 0
    this._totalLoopsDone = 0
    this._updateSpriteToIndex(0)
  }

  _detach() {
    this._fps = undefined
    this._index = undefined
    this._totalLoopsDone = undefined
    this._spriteAnimationSets = undefined
    this._totalColumns = undefined
    this._totalRows = undefined
    this._totalLoops = undefined
  }


  // Start sprite animation
  start() {
    if (this._totalColumns == undefined) this._totalColumns = 0
    if (this._totalRows == undefined) this._totalRows = 0
    if (this._fps == undefined) this._fps = 1
    if (this._spriteAnimationSets == undefined) this._spriteAnimationSets = {}

    this.stop()
    this._totalLoops = this._spriteAnimationSets.repeat
    this._reset()
    this._loopIsRunning = true
  }


  /*
 signals:
   'onLoopCycleStart': every time a loop starts
   'onLoopCycleEnd': every time a loop ends
   'onLoopCycleFinish': when reaching end of loops, and sprite animation ends
  */

  _updateSpritePosition() {
    this._updateSpriteToIndex(this._index)
    if (this._index === 0)
      this.signal('onLoopCycleStart')

    this._index++
    if (this._index > this._spriteAnimationSets.end) {
      if (this._totalLoops >= 0) this._totalLoopsDone++
      if (this._totalLoopsDone > this._totalLoops && this._totalLoops >= 0) {
        this.signal('onLoopCycleFinish')
        this.stop()
      }
      this._index = this._spriteAnimationSets.start
      this.signal('onLoopCycleEnd')
    }
  }


  _updateSpriteToIndex(index) {
    let currentColumn = index % this._totalColumns
    let currentRow = Math.floor(index / this._totalColumns)
    this.tag('Sprite').patch({
      x: -(currentColumn * this._xJumpInPixels),
      y: -(currentRow * this._yJumpInPixels),
    })
  }
}
