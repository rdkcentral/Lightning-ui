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

export default class Key extends Lightning.Component {
    static _template() {
        return {
            Background: {
                w: w => w, h: h => h, rect: true
            },
            Label: {
                mount: 0.5, x: w => w / 2, y: h => h / 2
            }
        }
    }

    _construct() {
        this._backgroundColors = {};
        this._labelColors = {};
    }

    set data(obj) {
        this._data = obj;
        this._update();
    }

    get data() {
        return this._data;
    }

    set labelText(obj) {
        this._labelText = obj;
        this.tag('Label').patch({text: obj});
    }

    get labelText() {
        return this._labelText;
    }

    set label(obj) {
        this.tag('Label').patch(obj);
    }

    get label() {
        return this.tag('Label');
    }

    set labelColors(obj) {
        this._labelColors = obj;
        this._update();
    }

    get labelColors() {
        return this._labelColors;
    }

    set backgroundColors(obj) {
        this._backgroundColors = obj;
        this._update();
    }

    get backgroundColors() {
        return this._backgroundColors;
    }

    set background(obj) {
        this.tag('Background').patch(obj);
    }

    get background() {
        return this.tag('Background');
    }

    _update() {
        if(!this.active) {
            return;
        }
        const { label = '' } = this._data;
        const hasFocus = this.hasFocus();

        let {focused, unfocused = 0xff000000} = this._backgroundColors;
        let {focused: labelFocused, unfocused: labelUnfocused = 0xffffffff} = this._labelColors;
        
        this.patch({
            Background: {color: hasFocus && focused ? focused : unfocused},
            Label: {text: {text: label}, color: hasFocus && labelFocused ? labelFocused : labelUnfocused}
        });
    }

    _firstActive() {
        this._update();
    }

    _focus() {
        let {focused, unfocused = 0xff000000} = this._backgroundColors;
        let {focused: labelFocused, unfocused: labelUnfocused = 0xffffffff} = this._labelColors;

        this.patch({
            Background: {smooth: {color: focused || unfocused}},
            Label: {smooth: {color: labelFocused || labelUnfocused}}
        });
    }

    _unfocus() {
        let {unfocused = 0xff000000} = this._backgroundColors;
        let {unfocused: labelUnfocused = 0xffffffff} = this._labelColors;

        this.patch({
            Background: {smooth: {color: unfocused}},
            Label: {smooth: {color: labelUnfocused}}
        });
    }

    static get width() {
        return 80;
    }

    static get height() {
        return 80;
    }
}