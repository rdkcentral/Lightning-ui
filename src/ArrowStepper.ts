import type Lightning from '@lightningjs/core';

import Stepper, { type StepperTemplateSpec } from './Stepper.js';

interface ArrowStepperTemplateSpec extends StepperTemplateSpec {
    ValueWrapper: {
        ArrowLeft: object,
        Value: object,
        ArrowRight: object
    }
}

export default class ArrowStepper
    extends Stepper<ArrowStepperTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<ArrowStepperTemplateSpec>
{
    ArrowLeft = this.ValueWrapper.getByRef('ArrowLeft')!;
    ArrowRight = this.ValueWrapper.getByRef('ArrowRight')!;

    static override _template(): Lightning.Component.Template<ArrowStepperTemplateSpec> {
        return {
            ...super._template(),
            ValueWrapper: {
                x: w => w - 30, w: 200, h: h => h, mountX: 1,
                ArrowLeft: {y: h => h * 0.5, mountY: 0.5},
                Value: {x: w => w * 0.5, y: h => h * 0.5, mountX: 0.5, mountY: 0.5, text: {text: '', fontSize: 22}},
                ArrowRight: {y: h => h * 0.5, x: w => w, mountY: 0.5, mountX: 1},
            }
        }
    }

    override _firstActive() {
        if(!this._focusAnimation) {
            this._createFocusAnimation();
        }
        const arrowLeft = this.ArrowLeft;
        const arrowRight = this.ArrowRight;
        if(!(arrowLeft.src !== undefined && arrowLeft.text !== null)) {
            arrowLeft.text = { text: '\u25c0', fontSize: 18 }
        }
        if(!(arrowRight.src !== undefined && arrowRight.text !== null)) {
            arrowRight.text = { text: '\u25b6', fontSize: 18 }
        }
        this._update();
    }

    protected override _createFocusAnimation() {
        this._focusAnimation = this.animation({duration: 0.2, stopMethod: 'reverse', actions: [
            {t: 'Focus', p: 'alpha', v: {0: 0, 1: 1}},
            {t: 'ValueWrapper.ArrowLeft', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}},
            {t: 'ValueWrapper.Value', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}},
            {t: 'ValueWrapper.ArrowRight', p: 'color', v: {0: this._labelColor, 1: this._labelColorFocused}}
        ]});
    }

    override _update() {
        this.patch({
            Focus: {color: this._focusColor},
            Label: {x: this._padding, color: this._labelColor, text: {text: this._label}},
            ValueWrapper: {x: w => w - this._padding,
                ArrowLeft: {color: this._labelColor},
                Value: {color: this._labelColor, text: {text: this.optionValue || ''+this.value}},
                ArrowRight: {color: this._labelColor},
            }
        });

        if(this.hasFocus()) {
            this._focus();
        }
    }
}