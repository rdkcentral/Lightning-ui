import Lightning from '@lightningjs/core';

export interface StepperTemplateSpec extends Lightning.Component.TemplateSpec{
    focusColor?: any,
    labelColor?: any,
    labelColorFocused?: any,
    padding?: number,
    max?: number,
    min?: number,
    value?: number,
    options?: Array<any>,
    focusAnimation?: any,

    Focus: object,
    Label: object,
    ValueWrapper: {
        Value: object
    }
}

interface StepperEvent {
    value: number,
    options?: object
}

export default class Stepper
    extends Lightning.Component<StepperTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<StepperTemplateSpec>
{
    Focus = this.getByRef('Focus')!;
    Label = this.getByRef('Label')!;
    ValueWrapper = this.getByRef('ValueWrapper')!;
    Value = this.ValueWrapper.getByRef('Value')!;

    private _focusColor = 0xff009245;
    private _labelColor = 0xff9d9d9d;
    private _labelColorFocused = 0xffffffff;
    private _padding = 30;
    private _max = 100;
    private _min = 0;
    private _value = 50;
    private _options = undefined;
    private _label = "label";
    private _focusAnimation: any = null;

    static override _template(): Lightning.Component.Template<StepperTemplateSpec> {
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

    override _firstActive() {
        if(!this._focusAnimation) {
            this._createFocusAnimation();
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

    override _handleLeft() {
        this.navigate(-1);
    }

    override _handleRight() {
        this.navigate(1);
    }

    private _createFocusAnimation() {
        this._focusAnimation = this.animation({duration: 0.2, stopMethod: 'reverse', actions: [
            {t: 'Focus', p: 'alpha', v: {0: 0, 1: 1}},
            {t: 'Label', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}},
            {t: 'ValueWrapper.Value', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}},
        ]});
    }

    private navigate(dir: number) {
        this.value = this.calcCarouselNavigation(dir, this._value, this._min, this._max);
        const event: StepperEvent = {
            value: this._value,
        }
        if(this._options) {
            event.options = this._options
        }
        this.fireAncestors('$onValueChanged', event);
        this.signal('onValueChanged', event);
    }

    private calcCarouselNavigation(dir: number, current: number, min: number, max: number) {
        let target = current + dir;
        if(target < min) {
            target = max;
        }
        if(target > max) {
            target = min;
        }
        return target;
    }

    _update() {
        this.patch({
            Focus: {color: this._focusColor},
            Label: {x: this._padding, color: this._labelColor, text: {text: this._label}},
            ValueWrapper: {x: w => w - this._padding,
                Value: {color: this._labelColor, text: {['text' as string]: this.optionValue || this.value}}
            }
        })
        if(this.hasFocus()) {
            this._focus();
        }
    }

    set label(v: string) {
        this._label = v;
        if(this.active) {
            this.Label.text.text = v;
        }
    }

    get label() {
        return this._label;
    }

    set value(v: number) {
        this._value = v;
        if(this.active) {
            this.Value.text.text = v.toString();
        }
    }

    get value() {
        return this._value;
    }

    get optionValue() {
        return this._options && this._options[this._value] && this._options[this._value]['label' as string] || undefined;
    }

    set options(v: any) {
        const refactor = v.map((option: any) => {
            if(typeof option === 'string') {
                return {label: option};
            }
            return option;
        });

        this._value = 0;
        this._options = refactor;
        this._max = refactor.length - 1;
        this._update();
    }

    get options() {
        return this._options;
    }

    set focusColor(v: any) {
        this._focusColor = v;
    }

    get focusColor() {
        return this._focusColor;
    }

    set labelColor(v: any) {
        this._labelColor = v;
    }

    get labelColor() {
        return this._labelColor;
    }

    set labelColorFocused(v: any) {
        this._labelColorFocused = v;
    }

    get labelColorFocused() {
        return this._labelColorFocused;
    }

    set padding(v: number) {
        this._padding = v;
    }

    get padding() {
        return this.padding;
    }

    set max(v: number) {
        this._max = v;
    }

    get max() {
        return this._max;
    }

    set min(v: number) {
        this._min = v;
    }

    get min() {
        return this._min;
    }

    set focusAnimation(v: any) {
        this._focusAnimation = v;
    }

    get focusAnimation() {
        return this._focusAnimation
    }
}