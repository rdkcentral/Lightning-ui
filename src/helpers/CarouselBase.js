import {
  getClientHeight,
  getClientWidth,
  getItemSizes,
  getPlotProperties,
  normalizePixelToPercentage,
} from './';

export const carouselBaseMixedWith = (C) => class L extends C {
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

        const {main, mainDim, mainMarginFrom, mainMarginTo, cross, crossDim} = getPlotProperties(this._direction);
        const viewBound = this[mainDim];
        let crossPos = 0, crossSize = 0;
        
        const scroll = this.scroll;
        const scrollIsAnchored = !isNaN(scroll);
        const scrollAnchor = scrollIsAnchored ? (scroll > 1 ? normalizePixelToPercentage(scroll) : scroll) : null;

        const scrollOffsetStart = 0;
        const positiveHalf = [];
        const negativeHalf = [];
        const itemIndex = this._index;
        let index = itemIndex;
        let position = scrollOffsetStart;

        while((viewBound - scrollOffsetStart) + this._tresholdEnd > position) {
            const item = items[index];
            const sizes = getItemSizes(item);

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
                type: this.itemWrapper,
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
            const sizes = getItemSizes(item);
            if(crossSize < sizes[crossDim]) {
                crossSize = sizes[crossDim];
            }

            position -= sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this._spacing);

            negativeHalf.push({
                componentIndex: index,
                type: this.itemWrapper,
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
            const {main, mainDim, directionIsRow} = getPlotProperties(this._direction);
            const bound = this[mainDim];
            const viewboundMain = directionIsRow ? getClientWidth() : getClientHeight();
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
export default class extends carouselBaseMixedWith(Object) {}