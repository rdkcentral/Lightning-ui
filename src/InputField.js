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

import Cursor from './helpers/Cursor.js';

export default class InputField extends Lightning.Component {
    static _template () {
        return {
            PreLabel: {renderOffscreen: true},
            PostLabel: {renderOffscreen: true},
            Cursor: {type: Cursor, rect: true, w: 4, h: 54, x: 0, y: 0},
        }
    }

    _construct() {
        this._input = '';
        this._previousInput = '';
        this._description = '';
        this._cursorX = 0;
        this._cursorIndex = 0;
        this._passwordMask = '*';
        this._passwordMode = false;
        this._autoHideCursor = true;
    }

    _init() {
        this.tag('PreLabel').on('txLoaded', () => { 
            this._labelTxLoaded();
        });
        this.tag('PostLabel').on('txLoaded', () => {
            this._labelTxLoaded
        });
    }

    onInputChanged({input = ''}) {
        let targetIndex = Math.max((input.length - this._input.length) + this._cursorIndex, 0);
        this._input = input;
        this._update(targetIndex);
    }

    toggleCursor(bool = !this._cursorVisible) {
        this._cursorVisible = bool;
        this.cursor[bool ? 'show' : 'hide']();
    }

    _labelTxLoaded() {
        const preLabel = this.tag('PreLabel');
        const cursor = this.tag('Cursor');
        const postLabel = this.tag('PostLabel');
        this.h = preLabel.renderHeight || postLabel.renderHeight;
        cursor.x = preLabel.renderWidth + this._cursorX;
        postLabel.x = cursor.x + cursor.w * (1 - cursor.mountX);

        if(!this.autoHideCursor) {
            this.toggleCursor(true);
        }
    }

    _update(index = 0) {
        const hasInput = this._input.length > 0;
        let pre = this._description + '';
        let post = '';

        if(hasInput) {
            pre = this._input.substring(0, index);
            post = this._input.substring(index, this._input.length);
            if(this._passwordMode){
                pre = this._passwordMask.repeat(pre.length);
                post = this._passwordMask.repeat(post.length);
            }
            this.toggleCursor(true);
        }
        else if(this._autoHideCursor){
            this.toggleCursor(false);
        }

        this.patch({
            PreLabel: {text: {text: pre}},
            PostLabel: {text: {text: post}},
        });

        if(this.h === 0) {
            this.tag('PreLabel').loadTexture();
            this.h = this.tag('PreLabel').renderHeight;
        }
        this._cursorIndex = index;
    }

    _handleRight() {
        this._update(Math.min(this._input.length, this._cursorIndex + 1));
    }

    _handleLeft() {
        this._update(Math.max(0, this._cursorIndex - 1));
    }

    _firstActive() {
        this._labelTxLoaded();
        this._update();
    }

    get input() {
        return this._input;
    }

    get hasInput() {
        return this._input.length > 0;
    }

    get cursorIndex() {
        return this._cursorIndex;
    }

    set inputText (obj) {
        this._inputText = obj;
        this.tag('PreLabel').patch({text: obj});
        this.tag('PostLabel').patch({text: obj});
    }

    get inputText() {
        return this._inputText;
    }

    set description(str) {
        this._description = str;
    }

    get description() {
        return this._description;
    }

    set cursor(obj) {
        if(obj.x) {
            this._cursorX = obj.x;
            delete obj.x;
        }
        this.tag('Cursor').patch(obj);
    }

    get cursor() {
        return this.tag('Cursor');
    }

    get cursorVisible() {
        return this._cursorVisible;
    }

    set autoHideCursor(bool){
        this._autoHideCursor = bool;
    }

    get autoHideCursor(){
        return this._autoHideCursor;
    }

    set passwordMode(val){
        this._passwordMode = val;
    }

    get passwordMode(){
        return this._passwordMode;
    }

    set passwordMask(str) {
        this._passwordMask = str;
    }

    get passwordmask() {
        return this._passwordMask;
    }
}