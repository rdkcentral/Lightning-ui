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

import ProgressBar from './ProgressBar.js';
import RangeInput from './Stepper.js';

export default class ProgressRangeInput extends RangeInput {
    static _template() {
        return {
            ...super._template(),
            ValueWrapper: {
                x: w => w, w: 370, h: h => h, mountX: 1,
                ProgressBar: {type: ProgressBar, y: h => h * 0.5, mountY: 0.5},
                Value: {y: h => h * 0.5, x: w => w, mountX: 1, mountY: 0.5, text: {text: '', fontSize: 22}}
            }
        }
    }

    _update() {
        this.patch({
            Focus: {color: 0xff4d4d4d},
            Label: {x: this._padding, color: this._labelColor, text: {text: this._label}},
            ValueWrapper: {x: w => w - this._padding,
                ProgressBar: {progressColor: this._focusColor, backgroundColor: this._labelColor, value: this._value},
                Value: {color: this._labelColor, text: {text: this._value}},
            }
        });

        if(this.hasFocus()) {
            this._focus();
        }
    }

    set value(str) {
        this._value = str;
        if(this.active) {
            this.tag('ProgressBar').value = this._value / (this._max - this._min);
            this.tag('Value').text.text = this._value;
        }
    }

    get value() {
        return this._value;
    }
}