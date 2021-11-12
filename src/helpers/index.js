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

export { default as CollectionWrapper } from './CollectionWrapper.js';
export { default as Cursor } from './Cursor.js';
export { default as ItemWrapper } from './ItemWrapper.js';
export { default as KeyWrapper } from './KeyWrapper.js';

export const limitWithinRange = (num, min, max) => {
    return Math.min(Math.max(num, min), max)
}

export const isFunction = value => {
    return typeof value === 'function'
}

export const isNumber = value => {
    return typeof value === 'number';
}

export const isInteger = value => {
    return (isNumber(value) && (value % 1) === 0);
}

export const isFloat = value => {
    return (isNumber(value) && (value % 1) !== 0);
}

export const getPlotProperties = (direction) => {
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

export const getItemSizes = (item) => {
    const itemType = item.type;
    if(item.component && item.component.__attached) {
        item = item.component;
    }
    return {
        w: item.w || (itemType && itemType['width']),
        h: item.h || (itemType && itemType['height']),
        margin: item.margin || (itemType && itemType['margin']) || 0,
        marginLeft: item.marginLeft || (itemType && itemType['marginLeft']),
        marginRight: item.marginRight || (itemType && itemType['marginRight']),
        marginTop: item.marginTop || (itemType && itemType['marginTop']),
        marginBottom: item.marginBottom || (itemType && itemType['marginBottom'])
    }
}

export const normalizePixelToPercentage = (value, max) => {
    if(value && value > 1) {
        return value / max;
    }
    return value || 0;
}