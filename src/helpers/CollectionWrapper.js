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

import CollectionBase from './CollectionBase.js';
import {
  getItemSizes,
  getPlotProperties,
  limitWithinRange,
  normalizePixelToPercentage,
} from './index.js';
import ItemWrapper from './ItemWrapper.js';

export default class CollectionWrapper extends CollectionBase {
    _indexChanged(obj) {    
        let {previousIndex:previous, index:target, dataLength:max, mainIndex, previousMainIndex, lines} = obj;
        if(!isNaN(previousMainIndex) && !isNaN(mainIndex) && !isNaN(lines)) {
            previous = previousMainIndex;
            target = mainIndex;
            max = lines;
        }
        if(this._requestsEnabled && !this._requestingItems) {
            if(previous < target && target + this._requestThreshold >= max) {
                this._requestingItems = true;
                this.signal('onRequestItems', obj)
                    .then((response) => {
                        const type = typeof response;
                        if(Array.isArray(response) || type === 'object' ||  type === 'string' || type === 'number') {
                            this.add(response);
                        }
                        if(response === false) {
                            this.enableRequests = false;
                        }
                        this._requestingItems = false;
                    })
            }
        }

        this._refocus();
        this.scrollCollectionWrapper(obj);
        this.signal('onIndexChanged', obj);
    }

    setIndex(index) {
        const targetIndex = limitWithinRange(index, 0, this._items.length - 1);
        const previousIndex = this._index;
        this._index = targetIndex;
        this._indexChanged({previousIndex, index: targetIndex, dataLength: this._items.length});
        return previousIndex !== targetIndex;
    }

    clear() {
        this._index = 0;
        super.clear();
    }

    addAt(item, index) {
        super.addAt(item, index);
        if(this._items && index >= 0 && index <= this._items.length && this._items.length > 0) {
            this.setIndex(this._index);
        }
    }

    up() {
        return this._attemptNavigation(-1, 1);
    }

    down() {
        return this._attemptNavigation(1, 1);
    }

    left() {
        return this._attemptNavigation(-1, 0);
    }

    right() {
        return this._attemptNavigation(1, 0);
    }

    first() {
        return this.setIndex(0);
    }

    last() {
        return this.setIndex(this._items.length - 1);
    }

    next() {
        return this.setIndex(this._index + 1);
    }

    previous() {
        return this.setIndex(this._index - 1);
    }

    _attemptNavigation(shift, direction) {
        if(this.hasItems) {
            return this.navigate(shift, direction);
        }
        return false;
    }

    navigate(shift, direction = this._direction) {
        if(direction !== this._direction) {
            return false;
        }
        return this.setIndex(this._index + shift);
    }

    scrollCollectionWrapper(obj) {
        let {previousIndex:previous, index:target, dataLength:max, mainIndex, previousMainIndex, lines} = obj;
        if(!isNaN(previousMainIndex) && !isNaN(mainIndex) && !isNaN(lines)) {
            previous = previousMainIndex;
            target = mainIndex;
            max = lines;
        }
        const {directionIsRow, main, mainDim, mainMarginFrom, mainMarginTo} = getPlotProperties(this._direction);
        const cw = this.currentItemWrapper;
        let bound = this[mainDim];
        if(bound === 0) {
            bound = directionIsRow ? 1920 : 1080;
        }
        const offset = Math.min(this.wrapper[main], this._scrollTransition && this._scrollTransition.targetValue || 0);

        const sizes = getItemSizes(cw);
        const marginFrom = (sizes[mainMarginFrom] || sizes.margin || 0);
        const marginTo = (sizes[mainMarginTo] || sizes.margin || 0);

        let scroll = this._scroll;

        if(!isNaN(scroll)) {
            if(scroll >= 0 && scroll <= 1) {
                scroll = bound * scroll - (cw[main] + cw[mainDim] * scroll);
            }
            else {
                scroll = scroll - cw[main];
            }
        }
        else if(typeof scroll === 'function') {
            scroll = scroll.apply(this, [cw, obj]);
        }
        else if(typeof scroll === 'object') {
            const {jump = false, after = false, backward = 0.0, forward = 1.0} = scroll;
            if(jump) {
                let mod = target % jump;
                if(mod === 0) {
                    scroll = marginFrom - cw[main];
                }
                if(mod === jump - 1) {
                    const actualSize = marginFrom + cw[mainDim] + marginTo;
                    scroll = (mod * actualSize) + marginFrom - cw[main]; 
                }
            }
            else if(after) {
                scroll = 0;
                if(target >= after - 1) {
                    const actualSize = marginFrom + cw[mainDim] + marginTo;
                    scroll = ((after - 1) * actualSize) + marginFrom - cw[main];
                }
            }
            else {
                const backwardBound = bound * normalizePixelToPercentage(backward, bound);
                const forwardBound = bound * normalizePixelToPercentage(forward, bound);
                if(target < max - 1 && (previous < target && offset + cw[main] + cw[mainDim] > forwardBound)) {
                    scroll = forwardBound - (cw[main] + cw[mainDim]);
                }
                else if(target > 0 && (target < previous && offset + cw[main] < backwardBound)) {
                    scroll = backwardBound - cw[main];
                }
                else if(target === max - 1) {
                    scroll = bound - (cw[main] + cw[mainDim]);
                }
                else if(target === 0) {
                    scroll = marginFrom - cw[main];
                }
            }
        }
        else if(isNaN(scroll)){
            if(previous < target && offset + cw[main] + cw[mainDim] > bound) {
                scroll = bound - (cw[main] + cw[mainDim])
            }
            else if(target < previous && offset + cw[main] < 0) {
                scroll = marginFrom - cw[main]
            }
        }

        if(this.active && !isNaN(scroll) && this._scrollTransition) {
            if(this._scrollTransition.isRunning()) {
                this._scrollTransition.reset(scroll, 0.05);
            }
            else {
                this._scrollTransition.start(scroll);
            }
        }
        else if(!isNaN(scroll)) {
            this.wrapper[main] = scroll
        }
    }

    _normalizePixelToPercentage(value, max) {
        if(value && value > 1) {
            return value / max;
        }
        return value || 0;
    }

    _getFocused() {
        if(this.hasItems) {
            return this.currentItemWrapper;
        }
        return this;
    }

    _handleRight() {
        return this.right()
    }

    _handleLeft() {
        return this.left()
    }

    _handleUp() {
        return this.up();
    }

    _handleDown() {
        return this.down();
    }

    get currentItemWrapper() {
        return this.wrapper.children[this._index];
    }

    get currentItem() {
        return this.currentItemWrapper.component;
    }

    set index(index) {
        this.setIndex(index);
    }

    get index() {
        return this._index;
    }

    get itemWrapper() {
        return ItemWrapper;
    }
}

CollectionWrapper.DIRECTION = {
    row: 0,
    column: 1
}