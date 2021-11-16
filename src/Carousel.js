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
  getItemSizes,
  getPlotProperties,
} from './helpers';
import { carouselBaseMixedWith } from './helpers/CarouselBase.js';

export default class Carousel extends carouselBaseMixedWith(CollectionWrapper) {
    navigate(shift, orientation = this._direction) {
        if(orientation !== this._direction) {
            return false;
        }
        this._cleanUp();
        const targetIndex = this._index + shift;
        const childList = this.wrapper.childList;
        const {main, mainDim, mainMarginFrom, mainMarginTo} = getPlotProperties(this._direction);
        const currentDataIndex = this.currentItemWrapper.componentIndex;
        let referenceItem = childList.last;
        if(shift < 0) {
            referenceItem = childList.first;
        }

        const targetDataIndex = this._normalizeDataIndex(referenceItem.componentIndex + shift);
        const targetItem = this._items[targetDataIndex];
        const sizes = getItemSizes(targetItem);
        
        let position = referenceItem[main] + (referenceItem[mainMarginFrom] || sizes.margin) + referenceItem[mainDim] + (sizes[mainMarginTo] || sizes.margin || this.spacing);
        if(shift < 0) {
            position = referenceItem[main] - (referenceItem[mainMarginTo] || sizes.margin)  - (sizes[mainDim] + (sizes[mainMarginFrom] || sizes.margin || this._spacing));
        }
        const child = this.stage.c({
            type: this.itemWrapper,
            componentIndex: targetDataIndex,
            forceLoad: this._forceLoad,
            ...sizes,
            [main]: position
        });

        childList.addAt(child, shift > 0 ? childList.length : 0);
        if(shift > 0) {
            this._index = targetIndex;
        }
        this._indexChanged({previousIndex: currentDataIndex, index: currentDataIndex + shift, dataLength: this._items.length});
        return true;
    }
}