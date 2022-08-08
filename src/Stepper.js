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

import { defineProperties } from './helpers';

const calcCarouselNavigation = (dir, current, min, max) => {
    let target = current + dir;
    if(target < min) {
        target = max;
    }
    if(target > max) {
        target = min;
    }
    return target;
}

export default class Stepper extends Lightning.Component {
    static _template() {
        return {
            h: 80, w: 574,
            Focus: {alpha: 0, w: w => w, h: h => h, rect: true},
            Label: {x: 30, y: h => h * 0.5, mountY: 0.5, text: {text: '', fontSize: 22}},
            ValueWrapper: {
                x: w => w - 30, w: 200, h: h => h, mountX: 1,
                Value: {x: w => w * 0.5, y: h => h * 0.5, mountX: 0.5, mountY: 0.5, text: {text: '', fontSize: 22}},
            }
        }
    }

    _construct() {
        this._focusColor = 0xff009245;
        this._labelColor = 0xff9d9d9d;
        this._labelColorFocused = 0xffffffff;
        this._padding = 30;

        this._max = 100;
        this._min = 0;

        this._value = 50;
        this._options = undefined;
        this._label = 'label';
        this._focusAnimation = null;
        defineProperties(this, ['focusColor', 'labelColor', 'labelColorFocused', 'padding', 'max', 'min', 'focusAnimation']);
    }

    _update() {
        this.patch({
            Focus: {color: this._focusColor},
            Label: {x: this._padding, color: this._labelColor, text: {text: this._label}},
            ValueWrapper: {x: w => w - this._padding,
                Value: {color: this._labelColor, text: {text: this.optionValue || this.value}}
            }
        });
        if(this.hasFocus()) {
            this._focus();
        }
    }

    _createFocusAnimation() {
        this._focusAnimation = this.animation({duration: 0.2, stopMethod: 'reverse', actions: [
            {t: 'Focus', p: 'alpha', v: {0: 0, 1: 1}},
            {t: 'Label', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}},
            {t: 'ValueWrapper.Value', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}},
        ]});
    }

    _firstActive() {
        if(!this._focusAnimation) {
            this._createFocusAnimation();
        }
        this._update();
    }

    _navigate(dir) {
        this.value = calcCarouselNavigation(dir, this._value, this._min, this._max);
        const event = {
            value: this._value
        }
        if(this._options) {
            event.options = this._options
        }
        this.fireAncestors('$onValueChanged', event);
        this.signal('onValueChanged', event);
    }

    _handleLeft() {
        this._navigate(-1);
    }

    _handleRight() {
        this._navigate(1);
    }

    _focus() {
        if(this._focusAnimation) {
            this._focusAnimation.start();
        }
    }

    _unfocus() {
        if(this._focusAnimation) {
            this._focusAnimation.stop();
        }
    }

    set label(str) {
        this._label = str;
        if(this.active) {
            this.tag('Label').text.text = str;
        }
    }

    get label() {
        return this._label;
    }

    set value(str) {
        this._value = str;
        if(this.active) {
            this.tag('Value').text.text = this.optionValue || this._value;
        }
    }

    get value() {
        return this._value;
    }

    get optionValue() {
        return this._options && this._options[this._value] && this._options[this._value].label || undefined;
    }

    set options(arr) {
        const refactor = arr.map((option) => {
            if(typeof option === 'string') {
                return {label: option};
            }
            return option;
        })

        this._value = 0;
        this._options = refactor;
        this._max = refactor.length - 1;
        this._update();
    }

    get options() {
        return this._options;
    }
}