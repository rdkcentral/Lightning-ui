import Lightning from '@lightningjs/core';

import ProgressBar from './ProgressBar.js';
import Stepper, { StepperTemplateSpec } from './Stepper.js';

interface ProgressStepperTemplateSpec extends StepperTemplateSpec {
    ValueWrapper: {
        ProgressBar: typeof ProgressBar
        Value: object,
    }
}

export default class ProgressStepper 
    extends Stepper
    implements Lightning.Component.ImplementTemplateSpec<ProgressStepperTemplateSpec>
{
    ProgressBar = this.ValueWrapper.getByRef('ProgressBar')!;

    static override _template(): Lightning.Component.Template<ProgressStepperTemplateSpec> {
        return {
            ...super._template(),
            ValueWrapper: {
                x: w => w, w: 370, h: h => h, mountX: 1,
                ProgressBar: {type: ProgressBar, y: h => h * 0.5, mountY: 0.5},
                Value: {y: h => h * 0.5, x: w => w, mountX: 1, mountY: 0.5, text: {text: '', fontSize: 22}}
            }
        }
    }

    override _update() {
        this.patch({
            Focus: {color: 0xff4d4d4d},
            Label: {x: this._padding, color: this._labelColor, text: {text: this._label}},
            ValueWrapper: {x: w => w - this._padding,
                ProgressBar: {progressColor: this._focusColor, backgroundColor: this._labelColor, value: this._value},
                Value: {color: this._labelColor, text: {text: this._value}},
            }
        });

        if(this.hasFocus()) {
            this._focus();
        }
    }

    override set value(v: string) {
        this._value = v;
        if(this.active) {
            this.ProgressBar.value = this._value / (this._max - this._min);
            this.Value.text.text = this._value;
        }
    }

    override get value() {
        return this._value;
    }
}