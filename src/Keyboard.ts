import Lightning from "@lightningjs/core";
import Key, { type KeyData } from "./Key.js";
import KeyWrapper from "./helpers/KeyWrapper.js";
import type InputField from "./InputField.js";

export interface KeyboardTemplateSpec extends Lightning.Component.TemplateSpecLoose {
    config?: object,
    currentInputField?: Lightning.Component,
    currentLayout?: string,
    maxCharacters?: number,
    Keys: object
}

interface LooseEvent {
    [s: string]: any;
}

interface InputChangedEvent {
    previousInput: string,
    input: string
}

interface PreviousKeyData {
    column: number,
    row: number
}

interface HandleEnterEvent {
    index: number,
    key: string
}

interface ConfigSpec {
    layouts: LayoutSpec,
    buttonTypes?: ButtonTypesSpec,
    styling?: StylingSpec
}

interface LayoutSpec {
    [key: string]: Array<string[]>
}

interface StylingSpec {
    [key: string]: any,
    x: number,
    margin: number,
    marginRight: number,
    marginLeft: number,
    marginTop: number,
    marginBottom: number,
    spacing: number,
    horizontalSpacing: number,
    verticalSpacing: number, 
    align: 'left' | 'center' | 'right'
}

interface ButtonTypesSpec {
    [key: string]: any
}

export interface KeyboardSignalMap extends Lightning.Component.SignalMap {
    (event: LooseEvent): void,
    onInputChanged(event: InputChangedEvent): void,
}

export interface KeyboardTypeConfig extends Lightning.Component.TypeConfigLoose {
    SignalMapType: KeyboardSignalMap
}

export default class Keyboard<
    TemplateSpec extends KeyboardTemplateSpec = KeyboardTemplateSpec,
    TypeConfigLoose extends KeyboardTypeConfig = KeyboardTypeConfig
>
    extends Lightning.Component<TemplateSpec, TypeConfigLoose>
    implements Lightning.Component.ImplementTemplateSpec<KeyboardTemplateSpec>
{
    Keys = (this as Keyboard).getByRef('Keys')! as Lightning.Element;

    private _input: string = '';
    private _inputField: undefined | Lightning.Component = undefined;
    private _maxCharacters: number = 56;
    private _navigationWrapAround: boolean = false;
    private _columnIndex: number = 0;
    private _rowIndex: number = 0;
    private _previous: null | PreviousKeyData = null;
    private _layout: string = '';
    private _config: ConfigSpec = {
        layouts: {}
    };

    static override _template(): Lightning.Component.Template<KeyboardTemplateSpec> {
        return {
            Keys: {w: w => w}
        }
    }

    resetFocus() {
        this._columnIndex = 0;
        this._rowIndex = 0;
        this._previous = null;
    }

    override _setup() {
        this._update();
    }

    _update() {
        const {layouts = {}, buttonTypes = {}, styling = {}} = this._config;
        if(!this._layout || (this._layout && layouts[this._layout] === undefined)) {
            console.error(`Configured layout "${this._layout}" does not exist. Picking first available: "${Object.keys(layouts)[0]}"`);
            this._layout = Object.keys(layouts)[0]!;
        }
        const {horizontalSpacing = 0, verticalSpacing = 0, align = 'left'} = styling as StylingSpec;
        let rowPosition = 0;
        const isEvent = /^[A-Z][A-Za-z0-9]{1}/;
        const hasLabel = /\:/;

        if(buttonTypes.default === undefined) {
            buttonTypes.default = Key;
        }

        this.Keys.children = layouts[this._layout]!.map((row: string[], rowIndex: number) => {
            const style = styling as StylingSpec;
            const {
                x = 0,
                margin = 0,
                marginRight,
                marginLeft,
                marginTop,
                marginBottom,
                spacing: rowHorizontalSpacing = horizontalSpacing || 0,
                align: rowAlign = align
            } = style[`Row${rowIndex+1}`] || {};

            let keyPosition = 0;
            let rowHeight = 0;
            const rowKeys = row.map((key, keyIndex) => {
                const origin = key;
                let keyType = buttonTypes.default;
                let action = 'Input';
                let label = key;

                if(isEvent.test(key)) {
                    if(hasLabel.test(key)) {
                        const split : string[] = key.split(':');
                        label = split[1]!.toString();
                        key = split[0]!;
                    }
                    if(buttonTypes[key]) {
                        keyType = buttonTypes[key];
                        action = (key as KeyData).action || key;
                    }
                }

                const keySpacing = keyType.margin || keyType.type.margin;
                const {
                    w = keyType.type.width || 0,
                    h = keyType.type.height || 0,
                    marginLeft = keyType.type.marginLeft || keySpacing || 0,
                    marginRight = keyType.type.marginRight || keySpacing || rowHorizontalSpacing,
                } = keyType;

                rowHeight = h > rowHeight ? h : rowHeight;
                const currentPosition = keyPosition + marginLeft;
                keyPosition += marginLeft + w + marginRight;
                return {ref: `Key-{${keyIndex + 1}}`, type: KeyWrapper, keyboard: this, x: currentPosition, w, h, key: {data: {origin, key, label, action}, w, h, ...keyType}}
            });

            let rowOffset = x + (marginLeft || margin);
            let rowMount = 0;

            if(this.w && rowAlign === 'center') {
                rowOffset = this.w / 2;
                rowMount = 0.5;
            }

            if(this.w && rowAlign === 'right') {
                rowOffset = this.w - (marginRight || margin);
                rowMount = 1;
            }

            const currentPosition = rowPosition + (marginTop|| margin);
            rowPosition = currentPosition + rowHeight + (marginBottom || margin || verticalSpacing);
            return {
                ref: `Row-${rowIndex + 1}`,
                x: rowOffset,
                mountX: rowMount,
                w: keyPosition,
                y: currentPosition,
                children: rowKeys
            }
        });
        this._refocus();
    }

    override _getFocused() {
        return this.currentKeyWrapper || this;
    }

    override _handleRight() {
        return this.navigate('row', 1);
    }

    override _handleLeft() {
        return this.navigate('row', -1);
    }

    override _handleUp() {
        return this.navigate('column', -1);
    }

    override _handleDown() {
        return this.navigate('column', 1);
    }

    override _handleKey(event: any) {
        let key = event.key ?? '';
        const code = event.code ?? 'CustomKey';
        if(code === 'Backspace' && this._input.length === 0) {
            return false;
        }
        if(key === ' ') {
            key = 'Space';
        }
        const targetFound = this._findKey(key);
        if(targetFound) {
            this._handleEnter();
        }
        return targetFound;
    }

    _findKey(str: string) {
        const rows = this._config.layouts[this._layout]!;
        let i = 0, j = 0;
        for(; i < rows.length; i++) {
            for (j = 0; j < rows[i]!.length; j++) {
                let key = rows[i]![j]!;
                if((str.length > 1 && key.indexOf(str) > -1) || key.toUpperCase() === str.toUpperCase()) {
                    this._rowIndex = i;
                    this._columnIndex = j;
                    return true;
                }
            }
        }
        return false;
    }

    override _handleEnter() {
        const {origin, action} = this.currentKey.data as KeyData;
        const event : HandleEnterEvent = {
            index: this._input.length,
            key: origin ?? ''
        };
        const inputField = this._inputField as unknown as InputField;
        if(inputField && inputField.cursorIndex) {
            event.index = inputField.cursorIndex;
        }
        if(action !== 'Input') {
            const split = event.key!.split(':')
            const call = `on${split[0]}`;
            
            const eventFunction = this[call as keyof this];
            event.key = split[1]!;
            if(eventFunction && (typeof eventFunction === 'function')) {
                eventFunction.call(this, event);
            }
            this.signal(call, {input: this._input, keyboard: this, ...event});
        }
        else {
            this.addAt(event.key!, event.index);
        }
    }

    _changeInput(input: string) {
        if(input.length > this._maxCharacters) {
            return;
        }
        const eventData = {
            previousInput: this._input,
            input: this._input = input
        };
        if(this._inputField && (this._inputField as unknown as InputField).onInputChanged) {
            (this._inputField as unknown as InputField).onInputChanged(eventData);
        }
        (this as Keyboard).signal('onInputChanged', eventData);
    }

    focus(str: string) {
        this._findKey(str);
    }

    override add<T extends string>(
        str: T,
    ): T;
    override add<T extends string>(str: T): void;
    override add(
        str: string,
    ): void;
    override add(str: string) : void {
        this._changeInput(this._input + str);
    }

    addAt(str: string, index: number) {
        if(index > this._input.length - 1) {
            this.add(str);
        }
        else if(index > -1) {
            this._changeInput(this._input.substring(0, index) + str + this._input.substring(index, this._input.length));
        }
    }

    remove() {
        this._changeInput(this._input.substring(0, this._input.length - 1));
    }

    removeAt(index: number) {
        if(index > this._input.length - 1) {
            this.remove();
        }
        else if(index > -1) {
            this._changeInput(this._input.substring(0, index-1) + this._input.substring(index, this._input.length));
        }
    }

    clear() {
        this._changeInput('');
    }

    layout(key: string) {
        if(key === this._layout) {
            return;
        }
        this._layout = key;
        if(this.attached) {
            this.resetFocus();
            this._update();
        }
    }

    inputField(component: Lightning.Component) {
        if(component) {
            const comp = component as unknown as InputField;
            this._rowIndex = 0;
            this._columnIndex = 0;
            this._input = comp.input !== undefined ? comp.input : '';
            this._inputField = component;
        }
        else {
            this._rowIndex = 0;
            this._columnIndex = 0;
            this._input = ''
            this._inputField = undefined;
        }
    }

    navigate(direction: string, shift: number) : boolean {
        const targetIndex = (direction === 'row' ? this._columnIndex : this._rowIndex) + shift;
        const currentRow = this.rows[this._rowIndex]!;
        if(direction === 'row' && targetIndex > -1 && targetIndex < currentRow.children.length) {
            this._previous = null;
            this._columnIndex = targetIndex
            return true;
        } else if (direction === 'row' && this._navigationWrapAround) {
            this._previous = null;
            let rowLen = currentRow.children.length;
            this._columnIndex = (targetIndex%rowLen + rowLen)%rowLen;
            return true
        }
        if(direction === 'column' && targetIndex > -1 && targetIndex < this.rows.length ) {
            const currentRowIndex = this._rowIndex;
            const currentColumnIndex = this._columnIndex;
            if(this._previous && this._previous.row === targetIndex) {
                const tmp = this._previous.column;
                this._previous.column = this._columnIndex;
                this._columnIndex = tmp;
                this._rowIndex = this._previous.row;
            }
            else {
                const targetRow = this.rows[targetIndex]!;
                const currentKey = this.currentKeyWrapper;
                const currentRow = this.rows[this._rowIndex]!;
                const currentX = currentRow.x - (currentRow.w * currentRow.mountX)  + currentKey.x;
                const m = targetRow.children.map((key) => {
                    const keyX = targetRow.x - (targetRow.w * targetRow.mountX) + key.x;
                    if(keyX <= currentX && currentX < keyX + key.w) {
                        return (keyX + key.w) - currentX;
                    }
                    if(keyX >= currentX && keyX <= currentX + currentKey.w) {
                        return (currentX + currentKey.w) - keyX;
                    }
                    return -1;
                });
                let acc = -1;
                let t = -1;

                for(let i = 0; i < m.length; i++) {
                    if(m[i] === -1 && acc > -1) {
                        break;
                    }
                    if(m[i]! > acc) {
                        acc = m[i]!;
                        t = i;
                    }
                }
                if(t > -1) {
                    this._rowIndex = targetIndex;
                    this._columnIndex = t;
                } // if no next row found and wraparound is on, loop back to first row
                else if(this._navigationWrapAround){
                    this._columnIndex = Math.min(this.rows[0]!.children.length-1, this._columnIndex)
                    this._rowIndex = 0;
                    return true;
                }
            }
            if(this._rowIndex !== currentRowIndex) {
                this._previous = {column: currentColumnIndex, row: currentRowIndex};
                this._rowIndex = targetIndex;
                return true;
            }
        }
        else if(direction === 'column' && this._navigationWrapAround){
          this._previous = {column: this._columnIndex, row: this._rowIndex};
          let nrRows = this.rows.length
          this._rowIndex = (targetIndex%nrRows + nrRows)%nrRows
          this._columnIndex = Math.min(this.rows[this._rowIndex]!.children.length-1, this._columnIndex)
        }
        return false;
    }

    onSpace(event: HandleEnterEvent) {
        this.addAt(' ', event.index ?? 0);
    }

    onBackspace(event: HandleEnterEvent) {
        this.removeAt(event.index ?? 0);
    }

    onClear() {
        this.clear();
    }

    onLayout(event: HandleEnterEvent) {
        this.layout(event.key);
    }

    set config(obj) {
        this._config = obj;
        if(this.active) {
            this._update();
        }
    }

    get config() {
        return this._config;
    }

    set currentInputField(component: Lightning.Component) {
        this.inputField(component);
    }

    get currentInputField() {
        return this._inputField as Lightning.Component;
    }

    set currentLayout(str) {
        this.layout(str);
    }

    get currentLayout() {
        return this._layout;
    }

    set maxCharacters(num) {
        this._maxCharacters = num;
    }

    get maxCharacters() {
        return this._maxCharacters;
    }

    get rows() {
        return this.Keys && this.Keys.children;
    }

    get currentKeyWrapper() {
        return this.rows && this.rows[this._rowIndex]!.children[this._columnIndex] as KeyWrapper;
    }

    get currentKey() {
        return this.currentKeyWrapper && this.currentKeyWrapper.key!
    }
}