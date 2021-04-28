import { CollectionWrapper, ItemWrapper, limitWithinRange} from "./helpers";

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
        while(-(scrollOffsetStart + this._tresholdStart) < position) {
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
        const targetIndex = this._index + shift;
        const childList = this.wrapper.childList;
        const scroll = this.scroll;
        const scrollIsAnchored = !isNaN(scroll);
        const {main, mainDim, mainMarginFrom, mainMarginTo} = this._getPlotProperties(this._direction);
        
        const bound = this[mainDim];
        const offset = Math.abs(this._scrollTransition && this._scrollTransition.targetValue || 0);

        const currentDataIndex = this.currentItemWrapper.componentIndex;
        let outOfBounds = true;

        const target = childList.getAt(targetIndex);
        if(!scrollIsAnchored && shift > 0 && (target[main] + target[mainDim]) <= offset + bound) {
            outOfBounds = false;
        }
        else if(!scrollIsAnchored && shift < 0 && target[main] >= offset + 0) {
            outOfBounds = false;
        }
        if(!outOfBounds) {
            this._index = targetIndex;
            this._indexChanged({previousIndex: currentDataIndex, index: targetIndex, dataLength: this._items.length})
        }
        else {
            let referenceItem = childList.last;
            let removeAt = 0;

            if(shift < 0) {
                referenceItem = childList.first;
                removeAt = childList.length - 1;
            }

            const targetDataIndex = this._normalizeDataIndex(referenceItem.componentIndex + shift);
            const targetItem = this._items[targetDataIndex];
            const sizes = this._getItemSizes(targetItem);
            
            let position = referenceItem[main] + (referenceItem[mainMarginFrom] || sizes.margin) + referenceItem[mainDim] + (sizes[mainMarginTo] || sizes.margin || this.spacing);

            if(shift < 0) {
                position = referenceItem[main] - (referenceItem[mainMarginTo] || sizes.margin)  - (sizes[mainDim] + (sizes[mainMarginFrom] || sizes.margin || this._spacing));
            }

            childList.removeAt(removeAt);

            const child = this.stage.c({
                type: ItemWrapper,
                componentIndex: targetDataIndex,
                forceLoad: this._forceLoad,
                ...sizes,
                [main]: position
            });

            childList.addAt(child, shift > 0 ? childList.length : 0);
            this._indexChanged({previousIndex: currentDataIndex, index: currentDataIndex + shift, dataLength: this._items.length});
        }
        return true;
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