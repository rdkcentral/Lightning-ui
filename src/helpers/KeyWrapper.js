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

import Lightning from "@lightningjs/core";

export default class KeyWrapper extends Lightning.Component {
    static _template() {
        return {
            clipbox: true
        }
    }

    _update() {
        let currentKey = this.children && this.children[0];
        if(currentKey && currentKey.action === this._key.data.action) {
            currentKey.patch({
                ...this._key
            });
        }
        else {
            this.children = [{type: this._key.keyType, ...this._key}];
        }
        if(this.hasFocus()) {
            this._refocus();
        }
    }

    set key(obj) {
        this._key = obj;
        if(this.active) {
            this._update();
        }
    }

    get key() {
        return this._key;
    }

    _active() {
        this._update();
    }

    _inactive() {
        this.childList.clear();
    }

    _getFocused() {
        return this.children && this.children[0] || this;
    }
}