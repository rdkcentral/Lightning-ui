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

export default class ProgressBar extends Lightning.Component {
    static _template() {
        return {
            w: 300, h: 10,
            Background: {w: w=>w, h: h => h, rect: true, rtt: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 5},
                Progress: {h: h=>h, w: 10, rect: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 0}}
            }
        }
    }

    _construct() {
        this._progressColor = 0xff009245;
        this._progressColorFocused = undefined;
        this._backgroundColor = 0xff9d9d9d;
        this._backgroundColorFocused = undefined;
        this._backgroundRadius = 5;
        this._progressRadius = 0;
        this.value = 0.5;
        defineProperties(this, ['progressColor', 'backgroundColor', 'progressColorFocused', 'backgroundColorFocused']);
    }

    progress(p) {
        if(p > 1) {
            p =  p / 100;
        }
        this._value = p;
        this.tag('Progress').w = this.w * p;
    }

    _createFocusAnimation() {
        this._focusAnimation = this.animation({duration: 0.2, stopMethod: 'reverse', actions: [
            {t: 'Background', p: 'color', v: {0: this._backgroundColor, 1: this._backgroundColorFocused || this._backgroundColor}},
            {t: 'Background.Progress', p: 'color', v: {0: this._progressColor, 1: this._progressColorFocused || this._progressColor}},
        ]});
    }

    _firstActive() {
        if(!this._focusAnimation) {
            this._createFocusAnimation();
        }
        this.patch({
            Background: {
                color: this._backgroundColor, shader: {radius: this._backgroundRadius},
                Progress: {
                    color: this._progressColor, shader: {radius: this._progressRadius}
                }
            }
        });
        this.progress(this._value);
        if(this.hasFocus()) {
            this._focus();
        }
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

    set value(p) {
        this._value = p;
        if(this.active) {
            this.progress(p);
        }
    }

    get value() {
        return this._value;
    }

    set backgroundRadius(num) {
        this._backgroundRadius = num;
        if(this.active) {
            this.tag('Background').shader.radius = num;
        }
    }

    get progressRadius() {
        return this._progressRadius;
    }

    set progressRadius(num) {
        this._progressRadius = num;
        if(this.active) {
            this.tag('Progress').shader.radius = num;
        }
    }

    get progressRadius() {
        return this._progressRadius;
    }

    get backgroundTag() {
        return this.tag('Background');
    }

    get progressTag() {
        return this.tag('Progress');
    }
}