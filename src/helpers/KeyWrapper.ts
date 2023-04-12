import Lightning from '@lightningjs/core';
import type { default as Key } from '../Key';

export interface KeyWrapperTemplateSpec extends Lightning.Component.TemplateSpec {
    key: Lightning.Component.NewPatchTemplate<typeof Key> | undefined
}

export default class KeyWrapper
    extends Lightning.Component<KeyWrapperTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<KeyWrapperTemplateSpec>
{
    private _key: Lightning.Component.NewPatchTemplate<typeof Key> | undefined = undefined;

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
        return (this.children && this.children[0] || this) as Lightning.Component;
    }

    update() {
        let currentKey = this.children && (this.children[0] as Key);
        let curKeyObj = this._key;
        if (!curKeyObj) {
            return;
        }
        if(currentKey && curKeyObj.data && currentKey.action === curKeyObj.data.action) {
            currentKey.patch({
                ...this._key
            });
        }
        else {
            this.children = [{...this._key}];
        }
        if(this.hasFocus()) {
            this._refocus();
        }
    }

    set key(v: Lightning.Component.NewPatchTemplate<typeof Key> | undefined) {
        this._key = v;
        if(this.active) {
            this.update();
        }
    }

    get key(): Lightning.Component.NewPatchTemplate<typeof Key> | undefined {
        return this._key;
    }
}