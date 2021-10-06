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

export {default as CollectionWrapper} from './CollectionWrapper.js';
export {default as Cursor} from './Cursor.js';
export {default as ItemWrapper} from './ItemWrapper.js';
export {default as KeyWrapper} from './KeyWrapper.js';

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