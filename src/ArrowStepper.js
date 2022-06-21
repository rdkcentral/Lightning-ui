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

import Stepper from './Stepper.js';

export default class ArrowStepper extends Stepper {
    static _template() {
        return {
            ...super._template(),
            ValueWrapper: {
                x: w => w - 30, w: 200, h: h => h, mountX: 1,
                ArrowLeft: {y: h => h * 0.5, mountY: 0.5},
                Value: {x: w => w * 0.5, y: h => h * 0.5, mountX: 0.5, mountY: 0.5, text: {text: '', fontSize: 22}},
                ArrowRight: {y: h => h * 0.5, x: w => w, mountY: 0.5, mountX: 1},
            }
        }
    }

    _update() {
        this.patch({
            Focus: {color: this._focusColor},
            Label: {x: this._padding, color: this._labelColor, text: {text: this._label}},
            ValueWrapper: {x: w => w - this._padding,
                ArrowLeft: {color: this._labelColor},
                Value: {color: this._labelColor, text: {text: this.optionValue || this.value}},
                ArrowRight: {color: this._labelColor},
            }
        });

        if(this.hasFocus()) {
            this._focus();
        }
    }

    _createFocusAnimation() {
        this._focusAnimation = this.animation({duration: 0.2, stopMethod: 'reverse', actions: [
            {t: 'Focus', p: 'alpha', v: {0: 0, 1: 1}},
            {t: 'ValueWrapper.ArrowLeft', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}},
            {t: 'ValueWrapper.Value', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}},
            {t: 'ValueWrapper.ArrowRight', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}}
        ]});
    }

    _firstActive() {
        if(!this._focusAnimation) {
            this._createFocusAnimation();
        }
        const arrowLeft = this.tag('ArrowLeft');
        const arrowRight = this.tag('ArrowRight');
        if(!(arrowLeft.src !== undefined && arrowLeft.text !== null)) {
            arrowLeft.text = { text: '\u25c0', fontSize: 18 }
        }
        if(!(arrowRight.src !== undefined && arrowRight.text !== null)) {
            arrowRight.text = { text: '\u25b6', fontSize: 18 }
        }
        this._update();
    }
}