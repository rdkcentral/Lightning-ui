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

import {
  CollectionWrapper,
  getPlotProperties,
  limitWithinRange,
} from './helpers';
import { gridBaseMixedWith } from './helpers/GridBase.js';

export default class Grid extends gridBaseMixedWith(CollectionWrapper) {
    clear() {
        this._mainIndex = 0;
        this._crossIndex = 0;
        super.clear();
    }

    setIndex(index) {
        const targetIndex = limitWithinRange(index, 0, this._items.length - 1);
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

    navigate(shift, direction) {
        const {directionIsRow, cross, crossDim} = getPlotProperties(this._direction);
        const overCross = ((directionIsRow && direction === CollectionWrapper.DIRECTION.column) 
            || (!directionIsRow && direction === CollectionWrapper.DIRECTION.row));

        let targetMainIndex = this._mainIndex + !!(!overCross) * shift;
        let targetCrossIndex = this._crossIndex + !!overCross * shift;
        let targetIndex = this._index;
        
        if(overCross && targetCrossIndex > -1 && targetCrossIndex <= this._lines[targetMainIndex].length) {
            if(this._lines[targetMainIndex][targetCrossIndex] !== undefined) {
                targetIndex = this._lines[targetMainIndex][targetCrossIndex];
                this._previous = undefined;
            }
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

                let acc = -1;
                let t = -1;
                for(let i = 0; i < m.length; i++) {
                    if(m[i] === -1 && acc > -1) {
                        break;
                    }
                    if(m[i] > acc) {
                        acc = m[i];
                        t = i;
                    }
                }
                if(t > -1) {
                    targetCrossIndex = t;
                    targetIndex = targetLine[t];
                }
            }
            this._previous = {mainIndex: this._mainIndex, crossIndex: this._crossIndex, realIndex: this._index};
        }

        if(this._index !== targetIndex) {
            this.setIndex(targetIndex);
            return true;
        }
        return false;
    }
}