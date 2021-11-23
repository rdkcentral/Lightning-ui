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

import Lightning from '@lightningjs/core';

export default class ItemWrapper extends Lightning.Component {
    static _template() {
        return {
            clipbox: true
        }
    }

    create() {
        if(this.children.length > 0) {
            return;
        }
        const component = this.fireAncestors('$getChildComponent', {index: this.componentIndex});
        component.isAlive = true;
        const {w, h, margin, marginUp, marginBottom, marginRight, marginLeft} = this;
        this.children = [{...component, w, h, margin, marginUp, marginRight, marginLeft, marginBottom}];
        if(this.hasFocus()) {
            this._refocus();
        }
    }

    get component() {
        return this.children[0] || this.fireAncestors('$getChildComponent', {index: this.componentIndex});
    }

    _setup() {
        if(this.forceLoad) {
            this.create();
        }
    }

    _active() {
        this.create();
    }

    _inactive() {
        if(!this.forceLoad) {
            this.children[0].isAlive = false;
            this.fireAncestors('$childInactive', {child: this});
            this.childList.clear();
        }
    }

    _getFocused() {
        return this.children && this.children[0] || this;
    }
}