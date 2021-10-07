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

export default class Cursor extends Lightning.Component {
    static _template() {
        return {
            alpha: 0
        }
    }

    _construct() {
        this._blink = true;
    }

    _init() {
        this._blinkAnimation = this.animation({duration: 1, repeat: -1, actions: [
            {p: 'alpha', v: {0: 0, 0.5: 1, 1: 0}}
        ]});
    }

    show() {
        if(this._blink) {
            this._blinkAnimation.start();
        }
        else {
            this.alpha = 1;
        }
    }

    hide() {
        if(this._blink) {
            this._blinkAnimation.stop();
        }
        else {
            this.alpha = 0;
        }
    }

    set blink(bool) {
        this._blink = bool;
        if(this.active) {
            if(bool) {
                this.show();
            }
            else {
                this.hide();
            }
        }
    }

    get blink() {
        return this._blink;
    }
}