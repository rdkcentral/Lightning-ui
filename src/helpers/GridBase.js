import {
  getItemSizes,
  getPlotProperties,
} from './';

export const gridBaseMixedWith = (C) => class G extends C {
    _construct() {
        this._crossSpacing = 5;
        this._mainSpacing = 5;
        this._rows = 0;
        this._columns = 0;
        this._lines = [[]];
        super._construct();
    }

    _getBiggestInLine(line) {
        const {mainDim} = getPlotProperties(this._direction);
        return line.reduce((biggestItem, newItem) => {
            if(newItem[mainDim] > biggestItem[mainDim]) {
                return newItem;
            }
            return biggestItem;
        });
    }

    plotItems() {
        const items = this._items;
        const wrapper = this.wrapper;

        const {directionIsRow, mainDirection, main, mainDim, mainMarginTo, mainMarginFrom, cross, crossDim, crossMarginTo, crossMarginFrom} = getPlotProperties(this._direction);
        // const crossSize = this[crossDim];
        let mainPos = 0, crossPos = 0, lineIndex = 0, crossSize = 0;

        const animateItems = [];

        const viewboundMain = directionIsRow ? 1920 : 1080;
        const viewboundCross = directionIsRow ? 1080 : 1920;
        const renderContext = this.core.renderContext

        this._lines = [[]];
        //create empty line array
        let cl = [];

        const newChildren = items.map((item, index) => {
            const sizes = getItemSizes(item);
            const targetCrossFromMargin = (sizes[crossMarginFrom] || sizes.margin || 0);

            if(index === 0) {
                mainPos += (sizes[mainMarginFrom] || sizes.margin || 0);
            }

            if(cl.length > 0 && ((this[mainDirection] > 0 && this[mainDirection] === cl.length) || (this[mainDirection] === 0 && crossPos + targetCrossFromMargin + sizes[crossDim] > crossSize))) {
                const lastInLine = cl[cl.length - 1];
                crossSize = Math.max(lastInLine[cross] + lastInLine[crossDim] + (lastInLine[crossMarginTo] || lastInLine.margin || this._mainSpacing), crossSize);
                const bil = this._getBiggestInLine(cl);
                mainPos = bil[main] + bil[mainDim] + (bil[mainMarginTo] || bil.margin || this._mainSpacing);
                crossPos = targetCrossFromMargin;
                this._lines.push([]);
                cl = [];
                lineIndex++;
            }
            else {
                crossPos += targetCrossFromMargin;
            }
            
            const ref = `IW-${item.assignedID}`;
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
            
            const newItem = {
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
            
            crossPos += sizes[crossDim] + (sizes[crossMarginTo] || sizes.margin || this._crossSpacing);
            this._lines[lineIndex].push(index);
            cl.push(newItem);
            return newItem; 
        });
        wrapper.children = newChildren;

        animateItems.forEach((index) => {
            const item = wrapper.children[index];
            item.patch({
                smooth: {x: item.assignedX, y: item.assignedY}
            });
        });

        const lastInLine = cl[cl.length - 1];
        crossSize = Math.max(lastInLine[cross] + lastInLine[crossDim] + (lastInLine[crossMarginTo] || lastInLine.margin || this._mainSpacing), crossSize);
        const biggestInLastLine = this._getBiggestInLine(cl);
        this._resizeWrapper({
            [mainDim]: biggestInLastLine[main] + biggestInLastLine[mainDim],
            [crossDim]: crossSize
        });
    }

    repositionItems() {
        const wrapper = this.wrapper;
        if(!wrapper && wrapper.children.length) {
            return true;
        }

        const {main, mainDim, mainMarginTo, mainMarginFrom, cross, crossDim, crossMarginTo, crossMarginFrom} = getPlotProperties(this._direction);
        const crossSize = this[crossDim];
        let mainPos = 0, crossPos = 0, lineIndex = 0;

        //create empty line array
        let cl = [];

        this.lines = [[]];

        wrapper.children.forEach((item, index) => {
            const sizes = getItemSizes(item);
            const targetCrossFromMargin = (sizes[crossMarginFrom] || sizes.margin || 0);

            if(index === 0) {
                mainPos += (sizes[mainMarginFrom] || sizes.margin || 0);
            }
            if(cl.length > 0 && ((this[mainDirection] > 0 && this[mainDirection] === cl.length) || (this[mainDirection] === 0 && crossPos + targetCrossFromMargin + sizes[crossDim] > crossSize))) {
                const bil = this._getBiggestInLine(cl);
                mainPos = bil[main] + bil[mainDim] + (bil[mainMarginTo] || bil.margin || this._mainSpacing);
                crossPos = targetCrossFromMargin;
                this._lines.push([]);
                cl = [];
                lineIndex++;
            }
            else {
                crossPos += targetCrossFromMargin;
            }
            
            item.patch({
                [`assigned${main.toUpperCase()}`]: mainPos,
                [`assigned${cross.toUpperCase()}`]: crossPos,
                [main]: mainPos,
                [cross]: crossPos
            });
            crossPos += sizes[crossDim] + (sizes[crossMarginTo] || sizes.margin || this._crossSpacing)
            this._lines[lineIndex].push(index);
            cl.push(newItem);
        });

        const biggestInLastLine = this._getBiggestInLine(cl);
        this._resizeWrapper({
            [mainDim]: biggestInLastLine[main] + biggestInLastLine[mainDim],
            [crossDim]: crossSize
        });
        super.repositionItems();
    }

    set rows(num) {
        this._rows = num;
        this.direction = 'row';
    }

    get rows() {
        return this._rows;
    }

    set columns(num) {
        this._columns = num;
        this.direction = 'column';
    }

    get columns() {
        return this._columns;
    }

    set crossSpacing(num) {
        this._crossSpacing = num;
    }

    get crossSpacing() {
        return this._crossSpacing;
    }

    set mainSpacing(num) {
        this._mainSpacing = num;
    }

    get mainSpacing() {
        return this._mainSpacing;
    }

    set spacing(num) {
        this._spacing = num;
        this._mainSpacing = num;
        this._crossSpacing = num;
    }
}

export default class extends gridBaseMixedWith(Object) {}