/**
 * Copyright 2021 Comcast Cable Communications Management, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lightning } from '@lightningjs/sdk';

import { getPlotProperties } from './';

export default class CollectionBase extends Lightning.Component {
    static _template() {
        return {
            Wrapper: {
            }
        }
    }

    _construct() {
        this._direction = CollectionBase.DIRECTION.row;
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

    clear() {
        this._uids = [];
        this._items = [];
        if(this.wrapper) {
            const hadChildren = this.wrapper.children > 0;
            this.wrapper.patch({
                x: 0, y: 0, children: []
            });
            if(hadChildren) {
                this._collectGarbage(true);
            }
        }
    }

    add(item) {
        this.addAt(item);
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

    remove(item) {
        if(this.hasItems && item.assignedID) {
            for(let i = 0; i < this.wrapper.children.length; i++) {
                if(this.wrapper.children[i].assignedID === item.assignedID) {
                    return this.removeAt(i);
                }
            }
        }
        else {
            throw new Error('remove: item not found');
        }
    }

    removeAt(index, amount = 1)  {
        if(index < 0 && index >= this._items.length) {
            throw new Error('removeAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
        const item = this._items[index];
        this._items.splice(index, amount);
        this.plotItems();
        return item;
    }

    reload(item) {
        this.clear();
        this.add(item)
    }

    plotItems(items, options) {
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
            const {main, mainDim, crossDim} = getPlotProperties(this._direction);
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
            id = Math.random().toString(36).substr(2, 9);
        }
        this._uids[id] = true;
        return id;
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

    set direction(string) {
        this._direction = CollectionBase.DIRECTION[string] || CollectionBase.DIRECTION.row;
    }

    get direction() {
        return Object.keys(CollectionBase.DIRECTION)[this._direction];
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

    get itemWrappers() {
        return this.wrapper.children;
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

    get scrollTo() {
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

CollectionBase.DIRECTION = {
    row: 0,
    column: 1
}