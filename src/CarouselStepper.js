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

import Carousel from './Carousel.js';
import { defineProperties } from './helpers';
import Stepper from './Stepper.js';

export default class CarouselStepper extends Stepper {
    static _template() {
        return {
            ...super._template(),
            ValueWrapper: {
                x: w => w, w: 440, h: h => h, mountX: 1, rtt: true, shader: {type: Lightning.shaders.FadeOut, left: 80, right: 80},
                Carousel: {type: Carousel, itemType: CarouselItem, y:15, w: 440, h: 50, scroll: 0.5, direction: 'row', signals: {onIndexChanged: true}}
            }
        }
    }

    _update() {
        this.patch({
            Focus: {color: 0xff4d4d4d},
            Label: {x: this._padding, color: this._labelColor, text: {text: this._label}},
            ValueWrapper: {
                x: w => w - this._padding,
            }
        });
        const carousel = this.tag('Carousel');
        carousel.add(this._options.map((option, index) => {return {label: option.label, index, w: 100, margin: 30, focusColor: this._focusColor, labelColor: this._labelColor, labelColorFocused: this._labelColorFocused}}));
        if(this.hasFocus()) {
            this._focus();
        }
    }

    _createFocusAnimation() {
        this._focusAnimation = this.animation({duration: 0.2, stopMethod: 'reverse', actions: [
            {t: 'Focus', p: 'alpha', v: {0: 0, 1: 1}}
        ]});
    }

    onIndexChanged() {
        this._value = this.tag('Carousel').currentItem.index;
        const event = {
            value: this._value
        }
        if(this._options) {
            event.options = this._options
        }
        this.fireAncestors('$onValueChanged', event);
        this.signal('onValueChanged', event);
    }

    set value(str) {
        this._value = str;
    }

    get value() {
        return this._value;
    }

    set options(arr) {
        this._value = 0;
        this._options = arr;
        if(this.active) {
            this._update();
        }
    }

    get options() {
        return this._options;
    }

    _getFocused() {
        return this.tag('Carousel');
    }
}

class CarouselItem extends Lightning.Component {
    static _template() {
        return {
            Focus: {alpha: 0, x: w => w * 0.5, y: h => h * 0.5, mount: 0.5, w: 120, h:50, rect: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 25}},
            Label: {x: w => w * 0.5, y: h => h * 0.5, mount: 0.5, renderOffscreen: true, text: {text: '', fontSize: 22}}
        }
    }

    _construct() {
        this._focusColor = 0xff009245;
        this._labelColor = 0xff9d9d9d;
        this._labelColorFocused = 0xffffffff;
        this._padding = 40;

        defineProperties(this, ['focusColor', 'labelColor', 'labelColorFocused', 'padding']);
    }

    set label(str) {
        this.tag('Label').text.text = str;
        this._label = str;
    }

    get label() {
        return this._label;
    }

    _init() {
        const label = this.tag('Label');
        label.on('txLoaded', () => {
            this.patch({
                w: label.renderWidth,
                Focus: {w: label.renderWidth + this._padding * 2}
            });
            if(this.collectionWrapper) {
                this.collectionWrapper.reposition();
            }
        });
    }

    _focus() {
        this.patch({
            Focus: {smooth: {alpha: 1}},
            Label: {smooth: {color: this._labelColorFocused}}
        });
    }

    _unfocus(target) {
        if(target.isCarouselItem === true) {
            this.patch({
                Focus: {smooth: {alpha: 0}},
                Label: {smooth: {color: this._labelColor}}
            });
        }
    }

    _firstActive() {
        this.patch({
            Focus: {color: this._focusColor},
            Label: {color: this._labelColor},
        });
        if(this.cparent.componentIndex === this.collectionWrapper.currentItemWrapper.componentIndex) {
            this._focus();
        }
    }

    get isCarouselItem() {
        return true;
    }

    static get width() {
        return 120;
    }

    static get height() {
        return 50;
    }
}