import Lightning from '@lightningjs/core';

import {TextAlign, type AnimationAttributes} from './helpers/index.js'

interface ScrollingLabelTemplateSpec extends Lightning.Component.TemplateSpec {
    autoStart?: boolean;
    fade?: number;
    spacing?: number;
    label?: object;
    align?: 'left' | 'center' | 'right',

    LabelClipper: {
        LabelWrapper: {
            Label: Lightning.Element,
            LabelCopy: Lightning.Element
        }
    }
}

export default class ScrollingLabel extends Lightning.Component<ScrollingLabelTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<ScrollingLabelTemplateSpec> {

    private _autoStart: boolean = false;
    private _scrollAnimation: Lightning.types.Animation | false = false;
    private _fade: number = 30;
    private _spacing: number = 30;
    private _label: object = {};
    private _align: 'left' | 'center' | 'right' = 'left';

    private _animationSettings: AnimationAttributes = {
        delay: 0.7,
        duration: 1,
        repeat: -1,
        stopMethod: 'immediate'
    };

    LabelClipper: Lightning.Element = (this as ScrollingLabel).getByRef('LabelClipper')!
    Label: Lightning.Element = this.LabelClipper.getByRef('LabelWrapper')!.getByRef('Label')!;
    LabelCopy: Lightning.Element = this.LabelClipper.getByRef('LabelWrapper')!.getByRef('LabelCopy')!;

    static override _template(): Lightning.Component.Template<ScrollingLabelTemplateSpec> {
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

    override _init() {
        const label = this.Label;
        label.on('txLoaded', () => {
            this._update(label);
            this._updateAnimation(label);
            if(this._autoStart) {
                this.start();
            }
        })
    }

    _update(label = this.Label) {
        const renderWidth = label.renderWidth;
        const noScroll = renderWidth <= this.renderWidth;
        let labelPos = 0;
        if(noScroll && this._align !== 'left') {
            labelPos = (this.renderWidth - renderWidth) * TextAlign[this._align];
        }

        this.LabelClipper.patch({
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

    _updateAnimation(label = this.Label) {
        if(this._scrollAnimation) {
            this._scrollAnimation.stopNow();
        }
        if(label.renderWidth > this.renderWidth) {
            if(!this._animationSettings.duration) {
                this._animationSettings.duration = label.renderWidth / 50;
            }
            this._scrollAnimation = this.animation({
                ...this._animationSettings,
                actions: [
                    {t: 'LabelWrapper', p: 'x', v: {sm: 0, 0: 0, 1.0: -(label.renderWidth + this._spacing)}},
                    {t: 'LabelClipper', p: 'shader.left' as '$$number', v: {0: 0, 0.2: this._fade, 0.8: this._fade, 1.0: 0}},
                ]
            });
        }
    }

    start() {
        if(this._scrollAnimation) {
            this._scrollAnimation.stopNow();
            this.LabelCopy.patch({
                text: this._label
            });
            this._scrollAnimation.start();
        }
    }

    stop() {
        if(this._scrollAnimation) {
            this._scrollAnimation.stopNow();
            this.LabelCopy.text = '';
        }
    }

    set label(obj: object) {
        if(typeof obj === 'string') {
            obj = {text: obj};
        }
        this._label = {...this._label, ...obj};
        this.Label.patch({
            text: obj
        });
    }

    get label() {
        return this.Label as object;
    }

    set align(pos) {
        this._align = pos;
    }

    get align() {
        return this._align;
    }

    set autoStart(bool) {
        this._autoStart = bool;
    }

    get autoStart() {
        return this._autoStart;
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

    set animationSettings(obj: Partial<AnimationAttributes>) {
        this._animationSettings = {...this._animationSettings, ...obj};
        if(this._scrollAnimation) {
            this._updateAnimation();
        }
    }

    get animationSettings() {
        return this._animationSettings;
    }
}