import Lightning from '@lightningjs/core';
import List from './List.js';

import { findIndexOfObject } from './helpers/index.js';
import ArrowStepper from './ArrowStepper.js';

interface ColorShiftTemplateSpec extends Lightning.Component.TemplateSpec {
    [key: string]: any;
    List: typeof List;
}

interface ColorBlindType {
    type: string,
    label: string
}

interface ColorSettings {
    [key: string]: any;
    correction: string,
    brightness: number,
    contrast: number,
    gamma: number
}


export default class ColorShift extends Lightning.Component<ColorShiftTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<ColorShiftTemplateSpec>{
    private _autoColorShift: boolean = true;
    private _focusColor: number = 0xff009245;
    private _labelColor: number = 0xff9d9d9d;
    private _labelColorFocused: number = 0xffffffff;

    private _currentCorrection: string = 'neutral';

    private _options: ColorBlindType[] = [
        {   
            type: 'neutral',
            label: 'normal'
        },
        {
            type: 'protanopia',
            label: 'Protanopia'
        },
        {
            type: 'deuteranopia',
            label: 'Deuteranopia'
        },
        {
            type: 'tritanopia',
            label: 'Tritanopia'
        },
        {
            type: 'monochromacy',
            label: 'Achromatopsia'
        }
    ];

    private _settings: ColorSettings = {
        correction: 'neutral',
        brightness: 50,
        contrast: 50,
        gamma: 50
    }

    private _stepperComponent: Lightning.Component | null = null;
    private _correctionComponent: Lightning.Component | null = null;
    private _brightnessComponent: Lightning.Component | null = null;
    private _contrastComponent: Lightning.Component | null = null;
    private _gammaComponent: Lightning.Component | null = null;


    List = (this as ColorShift).getByRef('List')!;
    
    static override _template(): Lightning.Component.Template<ColorShiftTemplateSpec> {
        return {
            w: 574,
            h: 240,
            List: {type: List, w: w => w, h: h => h, forceLoad: true, spacing: 0, direction: 'column'}
        }
    }

    override _getFocused() {
        return this.List as Lightning.Component;
    }

    _shiftColors() {
        if(this._autoColorShift && (this.application && this.application.colorshift)) {
            this.application.colorshift(this._settings.correction, this._settings);
        }
    }

    $onValueChanged() {
        const listItems = this.List.items;
        const correction = listItems[0];
        this._settings = {
            correction: correction.options[correction.value].type,
            brightness: listItems[1].value,
            contrast: listItems[2].value,
            gamma: listItems[3].value
        }

        if(this._currentCorrection && this._settings.correction !== this._currentCorrection) {
            const steppers = listItems.slice(1);
            steppers.forEach((stepper) =>  {
                stepper.value = 50;
            });
        }

        this._currentCorrection = this._settings.correction;
        this._shiftColors();
        this.signal('onColorShift', this._settings);
    }

    _update() {
        const list = this.List;
        const steppers = ['Brightness', 'Contrast', 'Gamma'];
        const options = this._options;
        const settings = this._settings;
        const colors = {
            focusColor: this._focusColor,
            labelColor: this._labelColor,
            labelColorFocused: this._labelColorFocused
        }
        this._shiftColors();
        const settingItems = steppers.map((stepper) => {
            const lowerC = stepper.toLocaleLowerCase();
            return {type: (this[`${lowerC}Component`] as Lightning.Component), label: stepper, value: settings[lowerC], w: this.finalW, h: 80, ...colors}
        });
        settingItems.unshift({type: this.correctionComponent, options, value: findIndexOfObject(options, settings.correction, 'type'), label: 'Color adjustment', w: this.finalW, h: 80, ...colors});
        list.clear();
        list.add(settingItems);
    }

    override _firstActive() {
        this._update();
    }

    set settings(obj) {
        this._settings = obj;
        if(this.active) {
            const listItems = this.List.items;
            listItems[0] = findIndexOfObject(this._options, obj.correction, 'type');
            listItems[1] = obj.brightness || 50;
            listItems[2] = obj.contrast || 50;
            listItems[3] = obj.gamma || 50;
        }
    }

    get settings() {
        return this._settings;
    }

    get correctionTag() {
        return this.List.items[0];
    }

    get brightnessTag() {
        return this.List.items[1];
    }

    get contrastTag() {
        return this.List.items[2];
    }

    get gammaTag() {
        return this.List.items[3];
    }

    get adjustmentTags() {
        return this.List.items;
    }

    set stepperComponent(component: Lightning.Component) {
        this._stepperComponent = component;
    }

    get stepperComponent() {
        return (this._stepperComponent || ArrowStepper) as Lightning.Component;
    }

    set correctionComponent(component: Lightning.Component) {
        this._correctionComponent = component;
    }

    get correctionComponent() {
        return (this._correctionComponent || this.stepperComponent) as Lightning.Component;
    }

    set brightnessComponent(component: Lightning.Component) {
        this._brightnessComponent = component;
    }

    get brightnessComponent() {
        return (this._brightnessComponent || this.stepperComponent) as Lightning.Component;
    }

    set contrastComponent(component: Lightning.Component) {
        this._contrastComponent = component;
    }

    get contrastComponent() {
        return (this._contrastComponent || this.stepperComponent) as Lightning.Component;
    }

    set gammaComponent(component: Lightning.Component) {
        this._gammaComponent = component;
    }

    get gammaComponent() {
        return (this._gammaComponent || this.stepperComponent) as Lightning.Component;
    }
}