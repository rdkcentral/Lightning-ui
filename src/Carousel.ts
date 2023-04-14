import {
    CollectionWrapper,
    ItemWrapper,
} from './helpers';
import type Lightning from '@lightningjs/core';
import type { CollectionWrapperTemplateSpec, ItemType } from './helpers/CollectionWrapper.js';

interface CarouselTemplateSpec extends CollectionWrapperTemplateSpec {
    Wrapper: object
}

interface CarouselArray extends Array<Lightning.Component.NewPatchTemplate<Lightning.Component.Constructor<ItemWrapper>>> {
    [key: number]: Lightning.Component.NewPatchTemplate<Lightning.Component.Constructor<ItemWrapper>>
}
export default class Carousel extends CollectionWrapper<CarouselTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<CarouselTemplateSpec>
{
    protected override _scroll = 0.5;
    protected _scrollOffsetStart = 0;
    protected _scrollOffsetEnd = 0;
    protected _tresholdStart = 400;
    protected _tresholdEnd = 400;
    protected _dataIndex = -1;
    protected _cleanUpDebounce: number | null = null;

    protected _threshold: number = 0;
    protected _thresholdStart: number = 0;
    protected _thresholdEnd: number = 0;

    override clear() {
        super.clear();
        this._dataIndex = 0;
    }

    _normalizeDataIndex(index: number, items = this._items) {
        if(index > items.length - 1) {
            return 0;
        }
        else if(index < 0) {
            return items.length - 1;
        }
        return index;
    }

    override plotItems() {
        const items = this._items;
        const wrapper = this.wrapper;

        const {main, mainDim, mainMarginFrom, mainMarginTo, cross, crossDim} = this._getPlotProperties(this._direction);
        const viewBound = this[mainDim];
        let crossPos = 0, crossSize = 0;

        const scroll = this._scroll;
        const scrollIsAnchored = !isNaN(scroll);
        const scrollAnchor = scrollIsAnchored ? (scroll > 1 ? this._normalizePixelToPercentage(scroll, viewBound) : scroll) : 0;

        const scrollOffsetStart = 0;
        const positiveHalf: CarouselArray = [];
        const negativeHalf: CarouselArray = [];
        const itemIndex = this._index;
        let isFirst = true;
        let index = itemIndex;
        let position = scrollOffsetStart;
        let currentDataIndex = null;

        if (this.currentItemWrapper) {
            currentDataIndex = this.currentItemWrapper.componentIndex;
        }

        while((viewBound - scrollOffsetStart) + this._tresholdEnd > position) {
            const item = items[index];
            const sizes = this._getItemSizes(item);

            if(isFirst && scrollIsAnchored) {
                isFirst = false;
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
        const posHalf = positiveHalf[0] as unknown as ItemType;
        position = posHalf[main] - (posHalf[mainMarginFrom] || posHalf.margin);
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
        const previousDataIndex = this._dataIndex;
        this._dataIndex = currentDataIndex || 0;
        wrapper.children = [...negativeHalf.reverse(), ...positiveHalf];
        this._indexChanged({previousIndex: previousDataIndex, index: this._dataIndex, dataLength: this._items.length});
    }

    override repositionItems() {
        const children = this.wrapper.children;
        const begin = children.slice(0, this._index);
        const end = children.slice(this._index + 1);

        const {main, mainDim, mainMarginFrom, mainMarginTo, cross, crossDim} = this._getPlotProperties(this._direction);
        let crossPos = 0, crossSize = 0;

        const viewBound = this[mainDim];

        const scroll = this._scroll;
        const scrollIsAnchored = !isNaN(scroll);
        const scrollAnchor = scrollIsAnchored ? (scroll > 1 ? this._normalizePixelToPercentage(scroll, viewBound) : scroll) : 0;

        const focusedItem = children[this._index]! as unknown as ItemType;

        let position = focusedItem[main] + (focusedItem[mainDim]- focusedItem.component[mainDim]) * scrollAnchor;

        const focusedItemSizes = this._getItemSizes(focusedItem);
        focusedItem.patch({
            ...focusedItemSizes,
            [`assigned${main.toUpperCase()}`]: position,
            [`assigned${cross.toUpperCase()}`]: crossPos,
            [main]: position,
            [cross]: crossPos
        });

        position = focusedItem[main] - (focusedItem[mainMarginFrom] || focusedItem.margin);

        begin.reverse().forEach((item) => {
            const sizes = this._getItemSizes(item);
            if(crossSize < sizes[crossDim]) {
                crossSize = sizes[crossDim];
            }

            position -= (sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this._spacing));
            item.patch({
                ...sizes,
                [`assigned${main.toUpperCase()}`]: position,
                [`assigned${cross.toUpperCase()}`]: crossPos,
                [main]: position,
                [cross]: crossPos
            });
        });

        position = focusedItem[main] + focusedItem[mainDim] + (focusedItem[mainMarginTo] || focusedItem.margin || this._spacing);
        end.forEach((item) => {
            const sizes = this._getItemSizes(item);
            if(crossSize < sizes[crossDim]) {
                crossSize = sizes[crossDim];
            }
            position += (sizes[mainMarginFrom] || sizes.margin || 0);

            item.patch({
                ...sizes,
                [`assigned${main.toUpperCase()}`]: position,
                [`assigned${cross.toUpperCase()}`]: crossPos,
                [main]: position,
                [cross]: crossPos
            });

            position += sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this._spacing);
        });
    }

    override navigate(shift: number, orientation = this._direction) {
        if(orientation !== this._direction) {
            return false;
        }
        this._cleanUp();
        const targetIndex = this._index + shift;
        const childList = this.wrapper.childList;
        const {main, mainDim, mainMarginFrom, mainMarginTo} = this._getPlotProperties(this._direction);
        const currentDataIndex = this.currentItemWrapper.componentIndex;
        let referenceItem = childList.last
        if (shift < 0) {
            referenceItem = childList.first;
        }

        const targetDataIndex = this._normalizeDataIndex(referenceItem.componentIndex + shift);
        const targetItem = this._items[targetDataIndex];
        const sizes = this._getItemSizes(targetItem);

        let position = referenceItem[main] + (referenceItem[mainMarginFrom] || sizes.margin) + referenceItem[mainDim] + (sizes[mainMarginTo] || sizes.margin || this.spacing);
        if (shift < 0) {
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

        const newDataIndex = currentDataIndex + shift

        if (shift > 0) {
            this._index = targetIndex;

            if (newDataIndex >= 0 && newDataIndex > this._items.length - 1) {
            this._dataIndex = 0
            } else {
            this._dataIndex = newDataIndex
            }
        } else {
            this._dataIndex = newDataIndex >= 0 ? newDataIndex : this._items.length - 1
        }

        this._indexChanged({ previousIndex: currentDataIndex, index: this._dataIndex, dataLength: this._items.length });

        return true;
    }

    override setIndex(index: number) {
        this._index = index;
        this.plotItems();
        return true;
    }

    override addAt(item: any, index = this._items.length) {
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

            const boundStart =  -viewboundMain * 0.66;
            const boundEnd = bound + viewboundMain * 0.66;

            let rem = children.reduce((acc: number[], child, index: number) => {
                if(((offset + child[main]) + child[mainDim] < boundStart) || (offset + child[main] > boundEnd)) {
                    acc.push(index)
                }
                return acc;
            }, []);

            if(rem.length > 0) {
                if(rem[0] === 0) {
                    for(let i = 0; i < rem.length; i++) {
                        if(!rem[i + 1] || (rem[i+1]! - rem[i]! !== 1)) {
                            this._index = this._index - (i + 1);
                            break;
                        }
                    }
                }
                rem.sort((a, b) => a - b).reverse().forEach((index) => {
                    this.wrapper.childList.removeAt(index);
                });
            }
        }, time)  as unknown as number;
    }

    override _inactive() {
        this._cleanUp(0);
        super._inactive();
    }

    override set index(index) {
        this.setIndex(index);
    }

    override get index() {
        return this._dataIndex;
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