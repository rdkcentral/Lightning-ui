import Lightning from '@lightningjs/core';

export interface KeyWrapperTemplateSpec extends Lightning.Component.TemplateSpec {
    key: object
}

export default class KeyWrapper
    extends Lightning.Component<KeyWrapperTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<KeyWrapperTemplateSpec>
{
    private _key = {};

    static override _template(): Lightning.Component.Template<KeyWrapperTemplateSpec> {
        return {
            clipbox: true
        }
    }

    override _active() {
        this.update();
    }

    override _inactive() {
        this.childList.clear();
    }

    override _getFocused() {
        return (this.children && this.children[0] || this)
    }

    update() {
        let currentKey = this.children && this.children[0];
        if(currentKey && currentKey.action === this._key.data.action) {
            currentKey.patch({
                ...this._key
            });
        }
        else {
            this.children = [{type: this._key.keyType, ...this._key}];
        }
        if(this.hasFocus()) {
            this._refocus();
        }
    }

    set key(v: object) {
        this._key = v;
        if(this.active) {
            this.update();
        }
    }

    get key() {
        return this._key;
    }
}