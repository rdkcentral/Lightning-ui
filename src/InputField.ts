import Lightning from '@lightningjs/core';
import Cursor from './helpers/Cursor.js';

interface InputFieldTemplateSpec extends Lightning.Component.TemplateSpec {
    input?: string;
    previousInput?: string;
    description?: string;
    //cursor?: CursorPatch;
    cursorX?: number;
    passwordMask?: string;
    passwordMode?: boolean;
    autoHideCursor?: boolean;
    labelPositionStatic?: boolean;
    maxLabelWidth?: number;
    PreLabel: Lightning.Element;
    PostLabel: Lightning.Element;
    Cursor: typeof Cursor;
}

interface CursorPatch {
    x?: number;
}

export default class InputField extends Lightning.Component<InputFieldTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<InputFieldTemplateSpec> {
    
    private _input: string = '';
    private _description: string = '';
    private _cursorX: number = 0;
    private _cursorIndex: number = 0;
    private _passwordMask: string = '*';
    private _passwordMode: boolean = false;
    private _autoHideCursor: boolean = true;
    private _labelPositionStatic: boolean = true;
    private _maxLabelWidth: number = 0;
    private _cursorVisible: boolean = false;
    private _inputText: object = {};

    PreLabel = (this as InputField).getByRef('PreLabel')!;
    PostLabel = (this as InputField).getByRef('PostLabel')!;
    Cursor = (this as InputField).getByRef('Cursor')!;

    static override _template(): Lightning.Component.Template<InputFieldTemplateSpec> {
        return {
            PreLabel: {renderOffscreen: true},
            PostLabel: {renderOffscreen: true},
            Cursor: {type: Cursor, rect: true, w: 4, h: 54, x: 0, y: 0},
        }
    }

    override _init() {
        this.PreLabel.on('txLoaded', () => {
            this._labelTxLoaded();
        });
        this.PostLabel.on('txLoaded', () => {
            this._labelTxLoaded
        });
    }

    onInputChanged({input = ''}) {
        let targetIndex = Math.max((input.length - this._input.length) + this._cursorIndex, 0);
        this._input = input;
        this._update(targetIndex);
    }

    toggleCursor(bool = !this._cursorVisible) {
        this._cursorVisible = bool;
        this.Cursor[bool ? 'show' : 'hide']();
    }

    _labelTxLoaded() {
        const preLabel = this.PreLabel;
        const cursor = this.Cursor;
        const postLabel = this.PostLabel;
        this.h = preLabel.renderHeight || postLabel.renderHeight;
        cursor.x = preLabel.renderWidth + this._cursorX;
        postLabel.x = cursor.x + cursor.w * (1 - cursor.mountX);
        this.setSmooth('x', this._labelOffset)
        if(!this.autoHideCursor) {
            this.toggleCursor(true);
        }
    }

    _update(index = 0) {
        const hasInput = this._input.length > 0;
        let pre = this._description + '';
        let post = '';

        if(hasInput) {
            pre = this._input.substring(0, index);
            post = this._input.substring(index, this._input.length);
            if(this._passwordMode){
                pre = this._passwordMask.repeat(pre.length);
                post = this._passwordMask.repeat(post.length);
            }
            this.toggleCursor(true);
        }
        else if(this._autoHideCursor){
            this.toggleCursor(false);
        }

        this.patch({
            PreLabel: {text: {text: pre}},
            PostLabel: {text: {text: post}},
        });

        if(this.h === 0) {
            this.PreLabel.loadTexture();
            this.h = this.PreLabel.renderHeight;
        }
        this._cursorIndex = index;
    }

    override _handleRight() {
        this._update(Math.min(this._input.length, this._cursorIndex + 1));
    }

    override _handleLeft() {
        this._update(Math.max(0, this._cursorIndex - 1));
    }

    override _firstActive() {
        this._labelTxLoaded();
        this._update();
    }

    set input(str: string) {
        this._input = str
        if(this.active) {
            this._update(str.length);
        }
    }

    get input() {
        return this._input;
    }

    get hasInput() {
        return this._input.length > 0;
    }

    get cursorIndex() {
        return this._cursorIndex;
    }

    set inputText (obj) {
        this._inputText = obj;
        this.PreLabel.patch({text: obj});
        this.PostLabel.patch({text: obj});
    }

    get inputText() {
        return this._inputText;
    }

    set description(str) {
        this._description = str;
    }

    get description() {
        return this._description;
    }

    //@ts-expect-error
    override set cursor(obj: CursorPatch) {
        if(obj.x) {
            this._cursorX = obj.x as number;
            delete obj.x;
        }
        this.Cursor.patch(obj);
    }

    //@ts-expect-error
    override get cursor() {
        return this.Cursor as CursorPatch;
    }

    get cursorVisible() {
        return this._cursorVisible;
    }

    set autoHideCursor(bool){
        this._autoHideCursor = bool;
    }

    get autoHideCursor(){
        return this._autoHideCursor;
    }

    set passwordMode(val){
        this._passwordMode = val;
    }

    get passwordMode(){
        return this._passwordMode;
    }

    set passwordMask(str: string) {
        this._passwordMask = str;
    }

    get passwordmask() {
        return this._passwordMask;
    }

    // the width at which the text start scrolling
    set maxLabelWidth(val) {
        this._maxLabelWidth = val;
    }

    get maxLabelWidth() {
        return this._maxLabelWidth;
    }

    set labelPositionStatic(val){
        this._labelPositionStatic = val;
    }

    get labelPositionStatic(){
        return this._labelPositionStatic;
    }

    get _labelOffset() {
        if (this._labelPositionStatic) return 0;
        let offset = this.maxLabelWidth - this.Cursor.x;
        return offset < 0 ? offset : 0;
    }
}