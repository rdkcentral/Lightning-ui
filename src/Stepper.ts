import Lightning from '@lightningjs/core';
import type { InlineElement } from '@lightningjs/core/dist/src/tree/Element.d.mts';

export interface StepperTemplateSpec extends Lightning.Component.TemplateSpec {
    focusColor?: number,
    labelColor?: number,
    labelColorFocused?: number,
    padding?: number,
    max?: number,
    min?: number,
    value?: number,
    options?: (string | StepperOption)[],
    focusAnimation?: Lightning.types.Animation | null,

    Focus: object,
    Label: object,
    ValueWrapper: {
        Value: object
    }
}

interface StepperOption {
    label: string
}

export interface StepperEvent {
    value: number,
    options?: StepperOption[]
}

export interface StepperSignalMap extends Lightning.Component.SignalMap {
    onValueChanged(event: StepperEvent): void
}


export interface StepperTypeConfig extends Lightning.Component.TypeConfig {
    SignalMapType: StepperSignalMap
}


export default class Stepper<
    TemplateSpec extends StepperTemplateSpec = StepperTemplateSpec,
    TypeConfig extends StepperTypeConfig = StepperTypeConfig
>
    extends Lightning.Component<TemplateSpec, TypeConfig>
    implements Lightning.Component.ImplementTemplateSpec<StepperTemplateSpec>
{
    Focus: Lightning.Element = (this as Stepper).getByRef('Focus')!;
    Label = (this as Stepper).getByRef('Label')!;
    /**
     * @privateRemarks
     * We explicitly allow ValueWrapper to be extended by subclasses, so we need to make this intention known
     * to the TypeScript compiler so that when subclasses access ValueWrapper, they can access the extended
     * version of ValueWrapper.
     */
    ValueWrapper = (this as Stepper).getByRef('ValueWrapper')! as Lightning.Element<InlineElement<TemplateSpec['ValueWrapper']>>;
    /**
     * @privateRemarks
     * Normally we wouldn't have to explicity assert the type of Value in this case, but there seems to be a bug in the
     * TypeScript compiler where if we don't do that here it causes VSCode to show inconsistent errors throughout the
     * project.
     */
    Value = (this as Stepper).ValueWrapper.getByRef('Value')! as Lightning.Element;

    protected _focusColor = 0xff009245;
    protected _labelColor = 0xff9d9d9d;
    protected _labelColorFocused = 0xffffffff;
    protected _padding = 30;
    protected _max = 100;
    protected _min = 0;
    protected _value = 50;
    protected _options: StepperOption[] = [];
    protected _label = "label";
    protected _focusAnimation: Lightning.types.Animation | null = null;

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

    protected _createFocusAnimation() {
        this._focusAnimation = (this as Stepper).animation({duration: 0.2, stopMethod: 'reverse', actions: [
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
        (this as Stepper).signal('onValueChanged', event);
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
        (this as Stepper).patch({
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
            this.Label.text!.text = v;
        }
    }

    get label() {
        return this._label;
    }

    set value(v: number) {
        this._value = v;
        if(this.active) {
            this.Value.text!.text = v.toString();
        }
    }

    get value() {
        return this._value;
    }

    get optionValue() {
        const option = this._options[this._value];
        return option && option.label || undefined;
    }

    set options(v: Array<StepperOption | string>) {
        const refactor = v.map((option) => {
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

    get options(): StepperOption[] {
        return this._options;
    }

    set focusColor(v: number) {
        this._focusColor = v;
    }

    get focusColor() {
        return this._focusColor;
    }

    set labelColor(v: number) {
        this._labelColor = v;
    }

    get labelColor() {
        return this._labelColor;
    }

    set labelColorFocused(v: number) {
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

    set focusAnimation(v: Lightning.types.Animation | null) {
        this._focusAnimation = v;
    }

    get focusAnimation() {
        return this._focusAnimation
    }
}