import {
  getItemSizes,
  getPlotProperties,
} from './';

export const listBaseMixedWith = (C) => class L extends C {
    plotItems() {
        const items = this._items;
        const wrapper = this.wrapper;
        const {directionIsRow, main, mainDim, mainMarginTo, mainMarginFrom, cross, crossDim} = getPlotProperties(this._direction);
        let crossPos = 0, crossSize = 0, position = 0;
        const animateItems = [];

        const viewboundMain = directionIsRow ? 1920 : 1080;
        const viewboundCross = directionIsRow ? 1080 : 1920;
        const renderContext = this.core.renderContext

        const newChildren = items.map((item, index) => {
            const sizes = getItemSizes(item);
            position += (sizes[mainMarginFrom] || sizes.margin || 0);
            
            if(crossSize < sizes[crossDim]) {
                crossSize = sizes[crossDim];
            }
            const ref = `IW-${item.assignedID}`;
            let mainPos = position;
            crossPos = item[cross] || crossPos;

            let tmp = mainPos;
            let tcp = crossPos;

            const existingItemWrapper = wrapper.tag(ref);

            if(existingItemWrapper && 
                ((existingItemWrapper.active && (crossPos !== existingItemWrapper[cross] || mainPos !== existingItemWrapper[main])) ||
                (!existingItemWrapper.active && ((renderContext[`p${main}`] + wrapper[main] + mainPos <= viewboundMain) || (renderContext[`p${cross}`] + wrapper[cross] + crossPos <= viewboundCross))))){
                tmp = existingItemWrapper[main];
                tcp = existingItemWrapper[cross];
                animateItems.push(index);
            }
            position += sizes[mainDim] + (sizes[mainMarginTo] || sizes.margin || this._spacing);
            return {
                ref,
                type: this.itemWrapper,
                componentIndex: index,
                forceLoad: this._forceLoad,
                ...sizes,
                [`assigned${main.toUpperCase()}`]: mainPos,
                [`assigned${cross.toUpperCase()}`]: crossPos,
                [main]: tmp,
                [cross]: tcp
            }
        });
        wrapper.children = newChildren;
        animateItems.forEach((index) => {
            const item = wrapper.children[index];
            item.patch({
                smooth: {x: item.assignedX, y: item.assignedY}
            });
        })
        this._resizeWrapper(crossSize);
    }

    repositionItems() {
        const wrapper = this.wrapper;
        if(!wrapper && wrapper.children.length) {
            return true;
        }
        const {main, mainDim, mainMarginTo, mainMarginFrom, cross, crossDim} = getPlotProperties(this._direction);
        let crossPos = 0, crossSize = 0, position = 0;
        wrapper.children.forEach((item) => {
            const sizes = getItemSizes(item.component);
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
export default class extends listBaseMixedWith(Object) {}