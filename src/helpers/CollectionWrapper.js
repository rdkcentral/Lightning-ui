
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

        this._spacing = 5;
        this._autoResize = false;
        
        this._requestingItems = false;
        this._requestMoreThreshold = 1;
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
    
    _indexChanged(obj) {
        let {previousIndex:previous, index:target, dataLength:max, mainIndex, previousMainIndex, lines} = obj;
        if(!isNaN(previousMainIndex) && !isNaN(mainIndex) && !isNaN(lines)) {
            previous = previousMainIndex;
            target = mainIndex;
            max = lines;
        }
        if(this._requestsEnabled && !this._requestingItems) {
            if(previous < target && target + this._requestMoreThreshold >= max) {
                this._requestingItems = true;
                this.signal('onRequestForItems', obj)
                    .then((response) => {
                        if(Array.isArray(response)) {
                            this.add(response);
                        }
                        this._requestingItems = false;
                    })
            }
        }

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
        this._uids = [];
        this._items = [];
        this._index = 0;
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
            if(typeof item == 'object' && !Array.isArray(item)) {
                item = [item];
            }
            const items = this._normalizeDataItems(item);
            this._items.splice(index, 0, ...items);
            this.plotItems();
            this.setIndex(this._index);
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
        if(typeof item == 'object') {
            item = [item];
        }
        this.clear();
        const items = this._normalizeDataItems(items);
        this._items = items;
        this.plotItems(items);
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
        this.signal('onItemsRepositioned');
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
        const {main, mainDim, mainMarginFrom, mainMarginTo} = this._getPlotProperties(this._direction);
        const cw = this.currentItemWrapper;
        const bound = this[mainDim];
        const offset = this._scrollTransition && this._scrollTransition.targetValue || 0;

        const sizes = this._getItemSizes(cw);
        const marginFrom = (sizes[mainMarginFrom] || sizes.margin || 0);
        const marginTo = (sizes[mainMarginTo] || sizes.margin || 0);

        let scroll = this.scroll;

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
                else if(target > 0 && (target < previous && offset + cw[main] < back)) {
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

        if(!isNaN(scroll) && this._scrollTransition) {
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
            id = Math.random().toString(36).substr(2, 9);
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
            mainMarginFrom: directionIsRow ? 'marginLeft' : 'marginUp',
            crossDirection: !directionIsRow ? 'columns' : 'rows',
            cross: directionIsRow ? 'y' : 'x',
            crossDim: directionIsRow ? 'h' : 'w',
            crossMarginTo: directionIsRow ? 'marginBottom' : 'marginRight',
            crossMarginFrom: directionIsRow ? 'marginUp' : 'marginLeft',
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
            margin: item.margin || (itemType && itemType['margin']),
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
            if(this.fireAncestors('$appCollectGarbage')) {
                return
            }
            this.stage.gc();
        }
    }

    _normalizeDataItems(array) {
        return array.map((item, index) => {
            return this._normalizeDataItem(item) || index;
        })
        .filter((item) => {
            if(!isNaN(item)) {
                Log.warn(`Item at index: ${item}, is not a valid item. Removing it from dataset`);
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
            return {assignedID: id, type: this.itemType, collectionWrapper: this, ...item}
        }
        return false;
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

    get requestingItems() {
        return this._requestingItems;
    }

    set requestThreshold(num) {
        this._requestMoreThreshold = num;
    }

    get requestMoreThreshold() {
        return this._requestMoreThreshold;
    }

    set enableRequests(bool) {
        this._requestsEnabled = bool
    }

    get enableRequests() {
        return this._requestsThreshold
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

    get currentItemComponent() {
        return this.currentItemWrapper.component;
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
        return this._items;
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

    set scrollTo(value) {
        this._scrollTo = value;
    }

    get scrollTo() {
        return this._scrollTo;
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