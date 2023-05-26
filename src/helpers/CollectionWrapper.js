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

import { limitWithinRange } from './index.js';

export default class CollectionWrapper extends Lightning.Component {
    static _template() {
        return {
            Wrapper: {
            }
        }
    }

    _construct() {
        this._direction = CollectionWrapper.DIRECTION.row;
        this._scrollTransitionSettings = this.stage.transitions.createSettings({});

        this._spacing = 0;
        this._autoResize = false;

        this._requestingItems = false;
        this._requestThreshold = 1;
        this._requestsEnabled = false;

        this._gcThreshold = 5;
        this._gcIncrement = 0;
        this._forceLoad = false;
        this.clear();
    }

    _setup() {
        this._updateScrollTransition();
    }

    _updateScrollTransition() {
        const axis = this._direction === 1 ? 'y' : 'x';
        this.wrapper.transition(axis, this._scrollTransitionSettings);
        this._scrollTransition = this.wrapper.transition(axis);
    }

    _indexChanged(obj, options = {}) {
        let { index: target, dataLength: max, mainIndex, previousMainIndex, lines } = obj;
        if (!isNaN(previousMainIndex) && !isNaN(mainIndex) && !isNaN(lines)) {
            target = mainIndex;
            max = lines;
        }
        if (this._requestsEnabled && !this._requestingItems) {
            if (target + this._requestThreshold >= max) {
                this.requestItems(false, obj);
            }
        }

        this._refocus();
        this.scrollCollectionWrapper(obj, options);

        if (obj.previousIndex !== obj.index) {
            this.signal('onIndexChanged', obj);
        }
    }

    requestItems(reload = false, obj = undefined) {
        if(obj === undefined) {
            obj = {
                previousIndex: 0,
                index: this._index,
                mainIndex: this._mainIndex || 0,
                previousMainIndex: this._mainIndex || 0,
                crossIndex: this._crossIndex || 0,
                previousCrossIndex: this._crossIndex || 0,
                lines: this._lines && this._lines.length || 0,
                dataLength: this._items && this._items.length || 0
            }
        }

        this._requestingItems = true;
        this._request(obj)
            .then((response) => {
                this._requestingItems = false;
                if(reload) {
                    this.clear();
                }

                const type = typeof response;
                if ((Array.isArray(response) && response.length > 0) || type === 'object' ||  type === 'string' || type === 'number') {
                    this.add(response);
                    obj.dataLength = this._items && this._items.length || 0;
                    this.signal('onRequestItemsAdded', obj);
                }
            });
    }

    _request(obj) {
        return new Promise((resolve) => {
            this.signal('onRequestItems', obj)
                .then((response) => {
                    if(response === undefined || response === false || (Array.isArray(response) && response.length === 0)) {
                        this.enableRequests = false;
                    }
                    resolve(response);
                });
        });
    }

    _requestMore(index, data = [], options) {
        const obj = {
            previousIndex: this._index,
            index,
            mainIndex: this._mainIndex || 0,
            previousMainIndex: this._previous && this._previous.mainIndex || 0,
            crossIndex: this._crossIndex || 0,
            previousCrossIndex: this._previous && this._previous.crossIndex || 0,
            lines: this._lines && this._lines.length || 0,
            dataLength: data.length + (this._items && this._items.length || 0)
        }
        this._requestingItems = true;
        return new Promise((resolve) => {
            this._request(obj)
                .then((response = []) => {
                    if (response) {
                        const newData = [...data, ...response];
                        if (index > this._items.length + newData.length) {
                            this._requestMore(index, newData).then(resolve);
                        } else {
                            this.add(newData);
                            obj.dataLength = this._items && this._items.length || 0;
                            this.signal('onRequestItemsAdded', obj);
                            this._requestingItems = false;
                            this.setIndex(index, options)
                            resolve(true);
                        }
                    } else {
                      this._requestingItems = false;
                      resolve(false);
                    }
                });
        })
    }

    setIndex(index, options = {}) {
        if (this._requestsEnabled && this._requestingItems) {
          return true;
        }
        if (this._requestsEnabled && (index > this._items.length - 1)) {
            this._requestMore(index, [], options);
            return true
        }
        if(this._items.length === 0) {
            return false;
        }
        const targetIndex = limitWithinRange(index, 0, this._items.length - 1);
        const previousIndex = this._index;
        this._index = targetIndex;
        this._indexChanged({ previousIndex, index: targetIndex, dataLength: this._items.length }, options);
        return previousIndex !== targetIndex;
    }

    clear() {
        this._uids = [];
        this._items = [];
        this._index = 0;
        if (this._scrollTransition) {
            this._scrollTransition.reset(0, 1);
        }
        if(this.wrapper) {
            const hadChildren = this.wrapper.children.length > 0;
            this.wrapper.patch({
                x: 0, y: 0, children: []
            });
            if(hadChildren) {
                this._collectGarbage(true);
            }
        }
    }

    add(item, options = {}) {
        this.addAt(item, this._items.length, options);
    }

    addAt(item, index = this._items.length, options = {}) {
        if(index >= 0 && index <= this._items.length) {
            if(!Array.isArray(item)) {
                item = [item];
            }
            const items = this._normalizeDataItems(item);
            this._items.splice(index, 0, ...items);
            this.plotItems(options);
            const targetIndex = index < this._index ? this._index + items.length : this._index;
            this.setIndex(targetIndex, options);
        }
        else {
            throw new Error('addAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
    }

    remove(target, options = {}) {
        if(this.hasItems && target.assignedID) {
            const itemWrappers = this.itemWrappers;
            for(let i = 0; i < this._items.length; i++) {
                let item = this._items[i];
                if(itemWrappers[i] && itemWrappers[i].component.isAlive) {
                    item = itemWrappers[i].component;
                }
                if(target.assignedID === item.assignedID) {
                    if(i === this._items.length-1 && item.hasFocus()) {
                        this._index = this._index - 1;
                    }
                    return this.removeAt(i, options);
                }
            }
        }
        else {
            throw new Error('remove: item not found');
        }
    }

    removeAt(index, amount = 1, options = {})  {
        if(index < 0 && index >= this._items.length) {
            throw new Error('removeAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
        const item = this._items[index];
        this._items.splice(index, amount);
        if(this._items.length > 0) {
            this.plotItems(options);
        }
        return item;
    }

    reload(item) {
        this.clear();
        this.add(item)
    }

    plotItems(options = {}) {
        //placeholder
    }

    reposition(time = 70) {
        if(this._repositionDebounce) {
            clearTimeout(this._repositionDebounce);
        }
        this._repositionDebounce = setTimeout(() => {
            this.repositionItems();
        }, time);
    }

    repositionItems() {
        //placeHolder
        this.signal('onItemsRepositioned')
    }

    up(options = {}) {
        return this._attemptNavigation(-1, 1, options);
    }

    down(options = {}) {
        return this._attemptNavigation(1, 1, options);
    }

    left(options = {}) {
        return this._attemptNavigation(-1, 0, options);
    }

    right(options = {}) {
        return this._attemptNavigation(1, 0, options);
    }

    first(options = {}) {
        return this.setIndex(0, options);
    }

    last(options = {}) {
        return this.setIndex(this._items.length - 1, options);
    }

    next(options = {}) {
        return this.setIndex(this._index + 1, options);
    }

    previous(options = {}) {
        return this.setIndex(this._index - 1, options);
    }

    _attemptNavigation(shift, direction, options = {}) {
        if(this.hasItems) {
            return this.navigate(shift, direction, options);
        }
        return false;
    }

    navigate(shift, direction = this._direction, options = {}) {
        if(direction !== this._direction) {
            return false;
        }
        return this.setIndex(this._index + shift, options);
    }

    scrollCollectionWrapper(obj, options = {}) {
        const { immediate = false } = options;
        let {previousIndex:previous, index:target, dataLength:max, mainIndex, previousMainIndex, lines} = obj;
        if(!isNaN(previousMainIndex) && !isNaN(mainIndex) && !isNaN(lines)) {
            previous = previousMainIndex;
            target = mainIndex;
            max = lines;
        }
        const {directionIsRow, main, mainDim, mainMarginFrom, mainMarginTo} = this._getPlotProperties(this._direction);
        const cw = this.currentItemWrapper;
        let bound = this[mainDim];
        if(bound === 0) {
            bound = directionIsRow ? 1920 : 1080;
        }
        const offset = Math.min(this.wrapper[main], this._scrollTransition && this._scrollTransition.targetValue || 0);

        const sizes = this._getItemSizes(cw);
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
                const backwardBound = bound * this._normalizePixelToPercentage(backward, bound);
                const forwardBound = bound * this._normalizePixelToPercentage(forward, bound);
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

        if(!immediate && this.active && !isNaN(scroll) && this._scrollTransition) {
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

    $childInactive({child}) {
        if(typeof child === 'object') {
            const index = child.componentIndex;
            for(let key in this._items[index]) {
                if(child.component[key] !== undefined) {
                    this._items[index][key] = child.component[key];
                }
            }
        }
        this._collectGarbage();
    }

    $getChildComponent({index}) {
        return this._items[index];
    }

    _resizeWrapper(crossSize) {
        let obj = crossSize;
        if(!isNaN(crossSize)) {
            const {main, mainDim, crossDim} = this._getPlotProperties(this._direction);
            const lastItem = this.wrapper.childList.last;
            obj = {
                [mainDim]: lastItem[main] + lastItem[mainDim],
                [crossDim]: crossSize
            }
        }
        this.wrapper.patch(obj);
        if(this._autoResize) {
            this.patch(obj);
        }
    }

    _generateUniqueID() {
        let id = '';
        while(this._uids[id] || id === '') {
            id = Math.random().toString(36).substring(2, 9);
        }
        this._uids[id] = true;
        return id;
    }

    _getPlotProperties(direction) {
        const directionIsRow = direction === 0;
        return {
            directionIsRow: directionIsRow ? true : false,
            mainDirection: directionIsRow ? 'rows' : 'columns',
            main: directionIsRow ? 'x' : 'y',
            mainDim: directionIsRow ? 'w' : 'h',
            mainMarginTo: directionIsRow ? 'marginRight' : 'marginBottom',
            mainMarginFrom: directionIsRow ? 'marginLeft' : 'marginTop',
            crossDirection: !directionIsRow ? 'columns' : 'rows',
            cross: directionIsRow ? 'y' : 'x',
            crossDim: directionIsRow ? 'h' : 'w',
            crossMarginTo: directionIsRow ? 'marginBottom' : 'marginRight',
            crossMarginFrom: directionIsRow ? 'marginTop' : 'marginLeft',
        }
    }

    _getItemSizes(item) {
        const itemType = item.type;
        if(item.component && item.component.__attached) {
            item = item.component;
        }
        return {
            w: item.w || (itemType && itemType['width']),
            h: item.h || (itemType && itemType['height']),
            margin: item.margin || (itemType && itemType['margin']) || 0,
            marginLeft: item.marginLeft || (itemType && itemType['marginLeft']),
            marginRight: item.marginRight || (itemType && itemType['marginRight']),
            marginTop: item.marginTop || (itemType && itemType['marginTop']),
            marginBottom: item.marginBottom || (itemType && itemType['marginBottom'])
        }
    }

    _collectGarbage(immediate) {
        this._gcIncrement++;
        if(immediate || (this.active && this._gcThreshold !== 0 && this._gcIncrement >= this._gcThreshold)) {
            this._gcIncrement = 0;
            this.stage.gc();
        }
    }

    _normalizeDataItems(array) {
        return array.map((item, index) => {
            return this._normalizeDataItem(item) || index;
        })
        .filter((item) => {
            if(!isNaN(item)) {
                console.warn(`Item at index: ${item}, is not a valid item. Removing it from dataset`);
                return false;
            }
            return true;
        });
    }

    _normalizeDataItem(item, index) {
        if(typeof item === 'string' || typeof item === 'number') {
            item = {label: item.toString()}
        }
        if(typeof item === 'object') {
            let id = this._generateUniqueID();
            return {assignedID: id, type: this.itemType, collectionWrapper: this, isAlive: false, ...item}
        }
        return index;
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

    _inactive() {
        if(this._repositionDebounce) {
            clearTimeout(this._repositionDebounce);
        }
        this._collectGarbage(true);
    }

    static get itemType() {
        return undefined;
    }

    set forceLoad(bool) {
        this._forceLoad = bool;
    }

    get forceLoad() {
        return this._forceLoad;
    }

    get requestingItems() {
        return this._requestingItems;
    }

    set requestThreshold(num) {
        this._requestThreshold = num;
    }

    get requestThreshold() {
        return this._requestThreshold;
    }

    set enableRequests(bool) {
        this._requestsEnabled = bool
    }

    get enableRequests() {
        return this._requestsEnabled
    }

    set gcThreshold(num) {
        this._gcThreshold = num;
    }

    get gcThreshold() {
        return this._gcThreshold;
    }

    get wrapper() {
        return this.tag('Wrapper');
    }

    get hasItems() {
        return this.wrapper && this.wrapper.children && this.wrapper.children.length > 0;
    }

    get currentItemWrapper() {
        return this.wrapper.children[this._index];
    }

    get currentItem() {
        return this.currentItemWrapper && this.currentItemWrapper.component || undefined;
    }

    set direction(string) {
        this._direction = CollectionWrapper.DIRECTION[string] || CollectionWrapper.DIRECTION.row;
    }

    get direction() {
        return Object.keys(CollectionWrapper.DIRECTION)[this._direction];
    }

    set items(array) {
        this.clear();
        this.add(array);
    }

    get items() {
        const itemWrappers = this.itemWrappers;
        return this._items.map((item, index) => {
            if(itemWrappers[index] && itemWrappers[index].component.isAlive) {
                return itemWrappers[index].component;
            }
            return item;
        });
    }

    get length() {
        return this._items.length;
    }

    set index(index) {
        this.setIndex(index);
    }

    get itemWrappers() {
        return this.wrapper.children;
    }

    get index() {
        return this._index;
    }

    set scrollTransition(obj) {
        this._scrollTransitionSettings.patch(obj);
        if(this.active) {
            this._updateScrollTransition();
        }
    }

    get scrollTransition() {
        return this._scrollTransition;
    }

    set scroll(value) {
        this._scroll = value;
    }

    get scroll() {
        return this._scroll;
    }

    set autoResize(bool) {
        this._autoResize = bool;
    }

    get autoResize() {
        return this._autoResize;
    }

    set spacing(num) {
        this._spacing = num;
    }

    get spacing() {
        return this._spacing;
    }
}

CollectionWrapper.DIRECTION = {
    row: 0,
    column: 1
}
