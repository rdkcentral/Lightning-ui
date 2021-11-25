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

export default class ScrollingLabel extends Lightning.Component {
    static _template() {
        return {
            LabelClipper: {
                w: w => w,
                rtt: true, shader: {type: Lightning.shaders.FadeOut},
                LabelWrapper: {
                    Label: {renderOffscreen: true},
                    LabelCopy: {renderOffscreen: true}
                }
            }
        }
    }

    _construct() {
        this._autoStart = true;
        this._scrollAnimation = false;
        this._fade = 30;
        this._spacing = 30;
        this._label = {};
        this._align = 'left';

        this._animationSettings = {
            delay: 0.7,
            repeat: -1,
            stopMethod: 'immediate'
        };
    }

    _init() {
        const label = this.tag('Label');
        label.on('txLoaded', () => {
            this._update(label);
            this._updateAnimation(label);
            if(this._autoStart) {
                this.start();
            }
        })
    }

    _update(label = this.tag('Label')) {
        const renderWidth = label.renderWidth;
        const noScroll = renderWidth <= this.w;
        let labelPos = 0;
        if(noScroll && this._align !== 'left') {
            labelPos = (this.w - renderWidth) * ScrollingLabel.ALIGN[this._align];
        }

        this.tag('LabelClipper').patch({
            h: label.renderHeight,
            shader: {
                right: noScroll ? 0 : this._fade
            },
            LabelWrapper: {
                x: 0,
                Label: {
                    x: labelPos
                },
                LabelCopy: {
                    x: renderWidth + this._spacing
                }
            }
        });
    }

    _updateAnimation(label = this.tag('Label')) {
        if(this._scrollAnimation) {
            this._scrollAnimation.stopNow();
        }
        if(label.renderWidth > this.w) {
            if(!this._scrollAnimation.duration) {
                this._scrollAnimation.duration = label.renderWidth / 50;
            }
            this._scrollAnimation = this.animation({
                ...this._animationSettings,
                actions: [
                    {t: 'LabelWrapper', p: 'x', v: {sm: 0, 0: 0, 1.0: -(label.renderWidth + this._spacing)}},
                    {t: 'LabelClipper', p: 'shader.left', v: {0: 0, 0.2: this._fade, 0.8: this._fade, 1.0: 0}},
                ]
            });
        }
    }

    start() {
        if(this._scrollAnimation) {
            this._scrollAnimation.stopNow();
            this.tag('LabelCopy').patch({
                text: this._label
            });
            this._scrollAnimation.start();
        }
    }

    stop() {
        if(this._scrollAnimation) {
            this._scrollAnimation.stopNow();
            this.tag('LabelCopy').text = '';
        }
    }

    set label(obj) {
        if(typeof obj === 'string') {
            obj = {text: obj};
        }
        this._label = {...this._label, ...obj};
        this.tag('Label').patch({
            text: obj
        });
    }

    get label() {
        return this.tag('Label');
    }

    set align(pos) {
        this._align = pos;
    }

    get align() {
        return this._align;
    }

    set repeat(num) {
        this.animationSettings = {repeat: num};
    }

    get repeat() {
        return this._animationSettings.repeat;
    }

    set delay(num) {
        this.animationSettings = {delay: num};
    }

    get delay() {
        return this._animationSettings.delay;
    }

    set duration(num) {
        this.animationSettings = {duration: num};
    }

    get duration() {
        return this._animationSettings.duration;
    }

    set animationSettings(obj) {
        this._animationSettings = {...this._animationSettings, ...obj};
        if(this._scrollAnimation) {
            this._updateAnimation();
        }
    }

    get animationSettings() {
        return this._animationSettings;
    }
}

ScrollingLabel.ALIGN = {
    left: 0,
    center: 0.5,
    right: 1
}