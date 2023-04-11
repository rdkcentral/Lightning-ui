import Lightning from '@lightningjs/core';

interface KeyData {
    origin?: string, 
    key?: string, 
    label?: string, 
    action?: string
}

interface FocusColors {
    focused: number,
    unfocused: number
}

interface KeyTemplateSpec extends Lightning.Component.TemplateSpec {
    data: KeyData,
    labelText: object,
    label: object,
    labelColors: {
        focused: number,
        unfocused?: number
    },
    backgroundColors: {
        focused: number,
        unfocused?: number
    },
    background: object,

    Background: object,
    Label: object
}

export default class Key extends Lightning.Component<KeyTemplateSpec> 
    implements Lightning.Component.ImplementTemplateSpec<KeyTemplateSpec> {

    private _data : KeyData = {};
    private _labelText = {};

    private _backgroundColors : FocusColors = {
        focused: 0xff000000,
        unfocused: 0xff000000,
    };

    private _labelColors : FocusColors = {
        focused: 0xffffffff,
        unfocused: 0xffffffff,
    };


    static override _template(): Lightning.Component.Template<KeyTemplateSpec> {
        return {
            Background: {
                w: w => w, h: h => h, rect: true
            },
            Label: {
                mount: 0.5, x: w => w / 2, y: h => h / 2
            }
        }
    }

    _update() {
        if(!this.active) {
            return;
        }
        const { label = '' } = this._data;
        const hasFocus = this.hasFocus();

        let {focused, unfocused = 0xff000000} = this._backgroundColors;
        let {focused: labelFocused, unfocused: labelUnfocused = 0xffffffff} = this._labelColors;
        
        this.patch({
            Background: {color: hasFocus && focused ? focused : unfocused},
            Label: {text: {text: label}, color: hasFocus && labelFocused ? labelFocused : labelUnfocused}
        });
    }

    static get width() {
        return 80;
    }

    static get height() {
        return 80;
    }

    set data(obj) {
        this._data = obj;
        this._update();
    }

    get data() {
        return this._data;
    }

    set labelText(obj) {
        this._labelText = obj;
        this.tag('Label')!.patch({text: obj});
    }

    get labelText() {
        return this._labelText;
    }

    set label(obj: object) {
        this.tag('Label')!.patch(obj);
    }

    get label() {
        return this.tag('Label') as object;
    }

    set labelColors(obj) {
        this._labelColors = obj;
        this._update();
    }

    get labelColors() {
        return this._labelColors;
    }

    set backgroundColors(obj) {
        this._backgroundColors = obj;
        this._update();
    }

    get backgroundColors() {
        return this._backgroundColors;
    }

    set background(obj: object) {
        this.tag('Background')!.patch(obj);
    }

    get background() {
        return this.tag('Background') as object;
    }
}