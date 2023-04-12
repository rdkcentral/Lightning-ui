
import CollectionWrapper from './helpers/CollectionWrapper.js';
import ItemWrapper from './helpers/ItemWrapper.js';


import type Lightning from '@lightningjs/core';

export default class List extends CollectionWrapper {
    override plotItems() {
        const items = this._items;
        const wrapper = this.wrapper;
        const {directionIsRow, main, mainDim, mainMarginTo, mainMarginFrom, cross, crossDim} = this._getPlotProperties(this._direction);
        let crossPos = 0, crossSize = 0, position = 0;
        const animateItems: number[] = [];

        const viewboundMain = directionIsRow ? 1920 : 1080;
        const viewboundCross = directionIsRow ? 1080 : 1920;
        const renderContext = this.core.renderContext;

        const newChildren = items.map((item, index) => {
            const sizes = this._getItemSizes(item);
            position += (sizes[mainMarginFrom] || sizes.margin || 0);

            if(crossSize < sizes[crossDim] ) {
                crossSize = sizes[crossDim];
            }
            const ref = `IW-${item.assignedID}`;
            let mainPos = position;
            crossPos = item[cross] || crossPos;

            let tmp = mainPos;
            let tcp = crossPos;

            const existingItemWrapper = wrapper.getByRef(ref) as ItemWrapper | undefined;

            if(existingItemWrapper &&
                ((existingItemWrapper.active && (crossPos !== existingItemWrapper[cross] || mainPos !== existingItemWrapper[main])) ||
                (!existingItemWrapper.active && ((renderContext[`p${main}`] + wrapper[main] + mainPos <= viewboundMain) || (renderContext[`p${cross}`] + wrapper[cross] + crossPos <= viewboundCross))))){
                tmp = existingItemWrapper[main];
                tcp = existingItemWrapper[cross];
                animateItems.push(index);
            }
            position += sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this._spacing);

            const type: Lightning.Component.NewPatchTemplate<Lightning.Component.Constructor<ItemWrapper>> = {
                ref,
                type: ItemWrapper,
                componentIndex: index,
                forceLoad: this._forceLoad,
                ...sizes,
                [`assigned${main.toUpperCase()}`]: mainPos,
                [`assigned${cross.toUpperCase()}`]: crossPos,
                [main]: tmp,
                [cross]: tcp
            }
            return type;
        });
        wrapper.children = newChildren;
        animateItems.forEach((index) => {
            const item = wrapper.children[index] as ItemWrapper;
            item.patch({
                smooth: {x: item.assignedX, y: item.assignedY}
            });
        })
        this._resizeWrapper(crossSize);
    }

    override repositionItems() {
        const wrapper = this.wrapper;
        if(!wrapper || wrapper.children.length === 0) {
            return true;
        }
        const {main, mainDim, mainMarginTo, mainMarginFrom, cross, crossDim} = this._getPlotProperties(this._direction);
        let crossPos = 0, crossSize = 0, position = 0;
        (wrapper.children as ItemWrapper[]).forEach((item) => {
            const sizes = this._getItemSizes(item);
            position += sizes[mainMarginFrom] || sizes.margin || 0;
            crossPos = item[cross] || crossPos;

            if(crossSize < sizes[crossDim]) {
                crossSize = sizes[crossDim];
            }
            const mainPos = position;
            position += sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this.spacing);
            item.patch({
                [`assigned${main.toUpperCase()}`]: mainPos,
                [`assigned${cross.toUpperCase()}`]: 0,
                [main]: mainPos,
                [cross]: crossPos,
                ...sizes
            });
        });
        this._resizeWrapper(crossSize);
        super.repositionItems();
    }
}