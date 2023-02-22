import Lightning from '@lightningjs/core';

export interface CursorTemplateSpec extends Lightning.Component.TemplateSpec {
    blink?: boolean,
    blinkAnimation?: Animation
}

export default class Cursor
    extends Lightning.Component<CursorTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<CursorTemplateSpec>
{
    private _blink = true;
    
    static override _template(): Lightning.Component.Template<CursorTemplateSpec> {
        return {
            alpha: 0
        }
    }

    override _init() {
        if(!this.blinkAnimation) {
            this.blinkAnimation = this.animation({duration: 1, repeat: -1, actions: [
                {p: 'alpha', v: {0: 0, 0.5: 1, 1: 0}}
            ]});
        }
    }

    show() {
        if(this.blink) {
            this.blinkAnimation.start();
        }
        else {
            this.alpha = 1;
        }
    }

    hide() {
        if(this.blink) {
            this.blinkAnimation.start();
        }
        else {
            this.alpha = 0
        }
    }

    set blink(v: boolean) {
        this._blink = v;
        if(this.active) {
            v ? this.show() : this.hide()
        }
    }

    get blink() {
        return this._blink;
    }
}