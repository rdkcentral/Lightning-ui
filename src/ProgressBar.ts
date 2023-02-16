import Lightning from '@lightningjs/core';

interface ProgressBarTemplateSpec extends Lightning.Component.TemplateSpec {
    progressColor?: any;
    progressColorFocused?: any;
    backgroundColor?: any;
    backgroundColorFocused?: any;
    backgroundRadius?: number;
    progressRadius?: number;

    Background: {
        Progress: object
    }
}

export default class ProgressBar extends Lightning.Component<ProgressBarTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<ProgressBarTemplateSpec> {

    Background = this.getByRef('Background');
    Progress = this.Background.getByRef('Progress');

    private _progressColor = 0xff009245;
    private _progressColorFocused = undefined;
    private _backgroundColor = 0xff9d9d9d;
    private _backgroundColorFocused = undefined;
    private _backgroundRadius = 5;
    private _progressRadius = 5;
    private _value = 0.5;
    private _focusAnimation: any = null;

    static override _template(): Lightning.Component.Template<ProgressBarTemplateSpec> {
        return {
            w: 300, h: 10,
            Background: {w: w => w, h: h => h, rect: true, rtt: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 5},
                Progress: {h: h => h, w: 10, rect: true, shader: {type: Lightning.shaders.RoundedRectangle, radius: 0}}
            }
        }
    }

    override _firstActive() {
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

    override _focus() {
        if(this._focusAnimation) {
            this._focusAnimation.start();
        }
    }

    override _unfocus() {
        if(this._focusAnimation) {
            this._focusAnimation.stop();
        }
    }

    private _createFocusAnimation() {
        this._focusAnimation = this.animation({duration: 0.2, stopMethod: 'reverse', actions: [
            {t: 'Background', p: 'color', v: {0: this._backgroundColor, 1: this._backgroundColorFocused || this._backgroundColor}},
            {t: 'Background.Progress', p: 'color', v: {0: this._progressColor, 1: this._progressColorFocused || this._progressColor}},
        ]});
    }

    progress(p: number) {
        if(p > 1) {
            p =  p / 100;
        }
        this._value = p;
        this.Progress.w = this.w * p;
    }

    set value(v: number) {
        this._value = v;
        if(this.active) {
            this.progress(v);
        }
    }

    get value() {
        return this._value;
    }

    set backgroundRadius(v: number) {
        this._backgroundRadius = v;
        if(this.active) {
            this.tag('Background').shader.radius = v;
        }
    }

    set progressRadius(v: number) {
        this._progressRadius = v;
        if(this.active) {
            this.tag('Progress').shader.radius = v;
        }
    }

    get progressRadius() {
        return this._progressRadius;
    }

    get backgroundTag() {
        return this.Background
    }

    get progressTag() {
        return this.Progress
    }
}