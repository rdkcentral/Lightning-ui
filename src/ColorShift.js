import Lightning from '@lightningjs/core';
import { List } from '@lightningjs/ui';

import ArrowAdjuster from './ArrowAdjuster';
import {
  defineProperties,
  findIndexOfObject,
} from './helpers';

export default class ColorShift extends Lightning.Component {
    static _template() {
        return {
            w: 574,
            h: 240,
            List: {type: List, w: w => w, h: h => h, forceLoad: true, spacing: 0, direction: 'column'}
        }
    }

    _construct() {
        this._autoColorShift = true;
        this._focusColor = 0xff009245;
        this._labelColor = 0xff9d9d9d;
        this._labelColorFocused = 0xffffffff;

        this._options = [
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

        defineProperties(this, ['focusColor', 'labelColor', 'labelColorFocused', 'options', 'autoColorShift']);
    }

    _getFocused() {
        return this.tag('List');
    }

    _shiftColors() {
        if(this._autoColorShift && (this.application && this.application.colorshift)) {
            this.application.colorshift(this._settings.correction, this._settings);
        }
    }

    $onValueChanged() {
        const listItems = this.tag('List').items;
        const correction = listItems[0];
        this._settings = {
            correction: correction.options[correction.value].type,
            brightness: listItems[1].value,
            contrast: listItems[2].value,
            gamma: listItems[3].value
        }

        if(this._currentCorrection && this._settings.correction !== this._currentCorrection) {
            const rangeInputs = listItems.slice(1);
            rangeInputs.forEach((rangeInput) =>  {
                rangeInput.value = 50;
            });
        }

        this._currentCorrection = this._settings.correction;
        this._shiftColors();
        this.signal('onColorShift', this._settings);
    }

    _update() {
        const list = this.tag('List');
        const rangeInputs = ['Brightness', 'Contrast', 'Gamma'];
        const options = this._options;
        const settings = this._settings;
        const colors = {
            focusColor: this._focusColor,
            labelColor: this._labelColor,
            labelColorFocused: this._labelColorFocused
        }
        this._shiftColors();
        const settingItems = rangeInputs.map((rangeInput) => {
            const lowerC = rangeInput.toLocaleLowerCase();
            return {type: this[`${lowerC}Component`], label: rangeInput, value: settings[lowerC], w: this.finalW, h: 80, ...colors}
        });
        settingItems.unshift({type: this.correctionComponent, options, value: findIndexOfObject(options, settings.correction, 'type'), label: 'Color adjustment', w: this.finalW, h: 80, ...colors});
        list.clear();
        list.add(settingItems);
    }

    _firstActive() {
        if(!this._settings) {
            this._settings = {
                correction: 'neutral',
                brightness: 50,
                contrast: 50,
                gamma: 50
            }
        }
        this._update();
    }

    set settings(obj) {
        this._settings = obj;
        if(this.active) {
            const listItems = this.tag('List').items;
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
        return this.tag('List').items[0];
    }

    get brightnessTag() {
        return this.tag('List').items[1];
    }

    get contrastTag() {
        return this.tag('List').items[2];
    }

    get gammaTag() {
        return this.tag('List').items[3];
    }

    get adjustmentTags() {
        return this.tag('List').items;
    }

    set rangeInputComponent(component) {
        this._rangeInputComponent = component;
    }

    get rangeInputComponent() {
        return this._rangeInputComponent || ArrowAdjuster;
    }

    set correctionComponent(component) {
        this._correctionComponent = component;
    }

    get correctionComponent() {
        return this._correctionComponent || this.rangeInputComponent;
    }

    set brightnessComponent(component) {
        this._brightnessComponent = component;
    }

    get brightnessComponent() {
        return this._brightnessComponent || this.rangeInputComponent;
    }

    set contrastComponent(component) {
        this._contrastComponent = component;
    }

    get contrastComponent() {
        return this._contrastComponent || this.rangeInputComponent;
    }

    set gammaComponent(component) {
        this._gammaComponent = component;
    }

    get gammaComponent() {
        return this._gammaComponent || this.rangeInputComponent;
    }
}