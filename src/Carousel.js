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

import { CollectionWrapper, ItemWrapper} from "./helpers";

export default class Carousel extends CollectionWrapper {
    static _template() {
        return {
            Wrapper: {}
        }
    }

    _construct() {
        super._construct();
        this._scrollAnchor = 0.5;
        this._scrollOffsetStart = 0;
        this._scrollOffsetEnd = 0;
        this._tresholdStart = 400;
        this._tresholdEnd = 400;
    }

    _normalizeDataIndex(index, items = this._items) {
        if(index > items.length - 1) {
            return 0;
        }
        else if(index < 0) {
            return items.length - 1;
        }
        return index;
    }

    plotItems() {
        const items = this._items;
        const wrapper = this.wrapper;

        const {main, mainDim, mainMarginFrom, mainMarginTo, cross, crossDim} = this._getPlotProperties(this._direction);
        const viewBound = this[mainDim];
        let crossPos = 0, crossSize = 0;
        
        const scroll = this.scroll;
        const scrollIsAnchored = !isNaN(scroll);
        const scrollAnchor = scrollIsAnchored ? (scroll > 1 ? this._normalizePixelToPercentage(scroll) : scroll) : null;

        const scrollOffsetStart = 0;
        const positiveHalf = [];
        const negativeHalf = [];
        const itemIndex = this._index;
        let index = itemIndex;
        let position = scrollOffsetStart;

        while((viewBound - scrollOffsetStart) + this._tresholdEnd > position) {
            const item = items[index];
            const sizes = this._getItemSizes(item);

            if(index === 0 && scrollIsAnchored) {
                position = (viewBound - sizes[mainDim]) * scrollAnchor;
            }
            else {
                position += (sizes[mainMarginFrom] || sizes.margin || 0);
            }

            if(crossSize < sizes[crossDim]) {
                crossSize = sizes[crossDim];
            }

            positiveHalf.push({
                type: ItemWrapper,
                componentIndex: index,
                forceLoad: this._forceLoad,
                ...sizes,
                [`assigned${main.toUpperCase()}`]: position,
                [`assigned${cross.toUpperCase()}`]: crossPos,
                [main]: position,
                [cross]: crossPos
            });
            position += sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this._spacing);
            index = this._normalizeDataIndex(index + 1, items);
        }
        position = positiveHalf[0][main] - (positiveHalf[0][mainMarginFrom] || positiveHalf[0].margin);
        index = itemIndex > 0 ? itemIndex - 1 : items.length - 1;
        let lastWidth = 0;
        while(-(scrollOffsetStart + this._tresholdStart) < position + lastWidth) {
            const item = items[index];
            const sizes = this._getItemSizes(item);
            if(crossSize < sizes[crossDim]) {
                crossSize = sizes[crossDim];
            }

            position -= sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this._spacing);

            negativeHalf.push({
                componentIndex: index,
                type: ItemWrapper,
                ...sizes,
                [`assigned${main.toUpperCase()}`]: position,
                [`assigned${cross.toUpperCase()}`]: crossPos,
                [main]: position,
                [cross]: crossPos
            });
            lastWidth = sizes[mainDim];
            position -= (sizes[mainMarginFrom] || sizes.margin);
            index = this._normalizeDataIndex(index - 1, items);
        }
        this._index = negativeHalf.length;
        wrapper.children = [...negativeHalf.reverse(), ...positiveHalf];
        this._indexChanged({previousIndex: this._index, index: this._index, dataLength: this._items.length});
    }

    navigate(shift, orientation = this._direction) {
        if(orientation !== this._direction) {
            return false;
        }
        this._cleanUp();
        const targetIndex = this._index + shift;
        const childList = this.wrapper.childList;
        const {main, mainDim, mainMarginFrom, mainMarginTo} = this._getPlotProperties(this._direction);
        const currentDataIndex = this.currentItemWrapper.componentIndex;
        let referenceItem = childList.last;
        if(shift < 0) {
            referenceItem = childList.first;
        }

        const targetDataIndex = this._normalizeDataIndex(referenceItem.componentIndex + shift);
        const targetItem = this._items[targetDataIndex];
        const sizes = this._getItemSizes(targetItem);
        
        let position = referenceItem[main] + (referenceItem[mainMarginFrom] || sizes.margin) + referenceItem[mainDim] + (sizes[mainMarginTo] || sizes.margin || this.spacing);
        if(shift < 0) {
            position = referenceItem[main] - (referenceItem[mainMarginTo] || sizes.margin)  - (sizes[mainDim] + (sizes[mainMarginFrom] || sizes.margin || this._spacing));
        }
        const child = this.stage.c({
            type: ItemWrapper,
            componentIndex: targetDataIndex,
            forceLoad: this._forceLoad,
            ...sizes,
            [main]: position
        });

        childList.addAt(child, shift > 0 ? childList.length : 0);
        if(shift > 0) {
            this._index = targetIndex;
        }
        this._indexChanged({previousIndex: currentDataIndex, index: currentDataIndex + shift, dataLength: this._items.length});
        return true;
    }

    setIndex(index) {
        this._index = index;
        this.plotItems();
        return true;
    }

    addAt(item, index = this._items.length) {
        if(index >= 0 && index <= this._items.length) {
            if(!Array.isArray(item)) {
                item = [item];
            }
            const items = this._normalizeDataItems(item);
            this._items.splice(index, 0, ...items);
            this.plotItems();
        }
        else {
            throw new Error('addAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
    }

    _cleanUp(time = 500) {
        if(this._cleanUpDebounce) {
            clearTimeout(this._cleanUpDebounce);
        }
        this._cleanUpDebounce = setTimeout(() => {
            const children = this.wrapper.children;
            const {main, mainDim, directionIsRow} = this._getPlotProperties(this._direction);
            const bound = this[mainDim];
            const viewboundMain = directionIsRow ? 1920 : 1080;
            const offset = this._scrollTransition && this._scrollTransition.targetValue || 0;
            
            let split = undefined;
            const boundStart = viewboundMain * 0.66;
            const boundEnd = bound + viewboundMain * 0.66;
            
            let rem = children.reduce((acc, child, index) => {
                if((offset + (child[main] + child[mainDim]) > bound + boundEnd) ||
                    (offset + child[main] < -boundStart)) {
                    if(acc[acc.length - 1] && index - acc[acc.length - 1] !== 1) {
                        split = acc.length;
                    }
                    acc.push(index);
                }
                return acc;
            }, []);

            if(rem.length > 0) {
                rem.sort((a, b) => a - b).reverse().forEach((index) => {
                    this.wrapper.childList.removeAt(index);
                });
                split = offset < 0 ? split || rem.length : split || 0;
                this._index = this._index - split;
            }
        }, time);
    }

    _inactive() {
        this._cleanUp(0);
        super._inactive();
    }

    set threshold(num) {
        this._threshold = num;
        this._thresholdStart = num;
        this._thresholdEnd = num;
    }

    get threshold() {
        return this._threshold;
    }

    set thresholdStart(num) {
        this._thresholdStart = num;
    }

    get thresholdStart() {
        return this._thresholdStart;
    }

    set thresholdEnd(num) {
        this._thresholdEnd = num;
    }

    get thresholdEnd() {
        return this._tresholdEnd;
    }
}