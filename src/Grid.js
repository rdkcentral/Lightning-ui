import { CollectionWrapper, ItemWrapper, limitWithinRange } from "./helpers";

export default class Grid extends CollectionWrapper {
    _construct() {
        this._crossSpacing = 5;
        this._mainSpacing = 5;
        this._rows = 0;
        this._columns = 0;
        super._construct();
    }

    clear() {
        super.clear();
        this._mainIndex = 0;
        this._crossIndex = 0;
    }

    setIndex(index) {
        const targetIndex = limitWithinRange(index, 0, this._items.length - 1);
        if(targetIndex === this._index) {
            return;
        }
        const previousIndex = this._index;
        const {mainIndex:previousMainIndex, crossIndex:previousCrossIndex} = this._findLocationOfIndex(this._index);
        const {mainIndex, crossIndex} = this._findLocationOfIndex(targetIndex);
        this._mainIndex = mainIndex;
        this._crossIndex = crossIndex;
        this._index = targetIndex;
        this._indexChanged({previousIndex, index: targetIndex, mainIndex, previousMainIndex, crossIndex, previousCrossIndex, lines: this._lines.length, dataLength: this._items.length});
    }

    _findLocationOfIndex(index) {
        for(let i = 0; i < this._lines.length; i++) {
            if(this._lines[i].includes(index)) {
                return {mainIndex: i, crossIndex: this._lines[i].indexOf(index)};
            }
        }
        return {mainIndex: -1, crossIndex: -1};
    }

    plotItems() {
        const items = this._items;
        const wrapper = this.wrapper;

        const {directionIsRow, mainDirection, main, mainDim, mainMarginTo, mainMarginFrom, cross, crossDim, crossMarginTo, crossMarginFrom} = this._getPlotProperties(this._direction);
        const crossSize = this[crossDim];
        let mainPos = 0, crossPos = 0, lineIndex = 0;

        const animateItems = [];

        const viewboundMain = directionIsRow ? 1920 : 1080;
        const viewboundCross = directionIsRow ? 1080 : 1920;
        const renderContext = this.core.renderContext

        this._lines = [[]];
        //create empty line array
        let cl = [];

        const newChildren = items.map((item, index) => {
            const sizes = this._getItemSizes(item);
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
                type: ItemWrapper,
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

        const {main, mainDim, mainMarginTo, mainMarginFrom, cross, crossDim, crossMarginTo, crossMarginFrom} = this._getPlotProperties(this._direction);
        const crossSize = this[crossDim];
        let mainPos = 0, crossPos = 0, lineIndex = 0;

        //create empty line array
        let cl = [];

        this.lines = [[]];

        wrapper.children.forEach((item, index) => {
            const sizes = this._getItemSizes(item);
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

    _getBiggestInLine(line) {
        const {mainDim} = this._getPlotProperties(this._direction);
        return line.reduce((biggestItem, newItem) => {
            if(newItem[mainDim] > biggestItem[mainDim]) {
                return newItem;
            }
            return biggestItem;
        });
    }

    navigate(shift, direction) {
        const {directionIsRow, cross, crossDim} = this._getPlotProperties(this._direction);
        const overCross = ((directionIsRow && direction === CollectionWrapper.DIRECTION.column) 
                            || (!directionIsRow && direction === CollectionWrapper.DIRECTION.row));

        let targetMainIndex = this._mainIndex + !!(!overCross) * shift;
        let targetCrossIndex = this._crossIndex + !!overCross * shift;
        let targetIndex = this._index;
        
        if(overCross && targetCrossIndex > -1 && targetCrossIndex <= this._lines[targetMainIndex].length) {
            const targetExists = this._lines[targetMainIndex][targetCrossIndex] !== undefined;
            if(!targetExists && targetCrossIndex > 0 && targetCrossIndex === this._lines[targetMainIndex].length && (this._lines[targetMainIndex - 1] && targetCrossIndex < this._lines[targetMainIndex - 1].length)) {
                targetMainIndex -= 1;
            }
            else if (!targetExists) {
                targetCrossIndex = this._crossIndex;
            }
            targetIndex = this._lines[targetMainIndex][targetCrossIndex];
            this._previous = undefined;
        }
        else if (!overCross && targetMainIndex < this._lines.length && targetMainIndex > -1){
            const targetLine = this._lines[targetMainIndex];
            if(this._previous && this._previous.mainIndex === targetMainIndex) {
                targetIndex = this._previous.realIndex;
                targetCrossIndex = this._previous.crossIndex;
            }
            else if(targetLine){
                const currentItem = this.currentItemWrapper;
                const m = targetLine.map((item) => {
                    const targetItem = this.wrapper.children[item];
                    if(targetItem[cross] <= currentItem[cross] && currentItem[cross] <= targetItem[cross] + targetItem[crossDim]) {
                        return targetItem[cross] + targetItem[crossDim] - currentItem[cross];
                    }
                    if(targetItem[cross] >= currentItem[cross] && targetItem[cross] <= currentItem[cross] + currentItem[crossDim]) {
                        return currentItem[cross] + currentItem[crossDim] - targetItem[cross];
                    }
                    return -1;
                });
                let t = m.reduce((acc, val, index, arr) => val > arr[acc] ? index : acc, 0);
                if(t === 0 && targetCrossIndex !== 0) {
                    t = targetLine.length - 1;
                }
                this._previous = this._index;
                targetCrossIndex = t;
                targetIndex = targetLine[t];
            }
            this._previous = {mainIndex: this._mainIndex, crossIndex: this._crossIndex, realIndex: this._index};
        }

        if(this._index !== targetIndex) {
            this.setIndex(targetIndex);
            return true;
        }
        return false;
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