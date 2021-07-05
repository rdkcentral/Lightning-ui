import Lightning from "@lightningjs/core";

export default class ItemWrapper extends Lightning.Component {
    static _template() {
        return {
            clipbox: true
        }
    }

    create() {
        if(this.children.length > 0) {
            return;
        }
        const component = this.fireAncestors('$getChildComponent', {index: this.componentIndex});
        component.isAlive = true;
        this.children = [{...component, w: this.w, h: this.h}];
        if(this.hasFocus()) {
            this._refocus();
        }
    }

    get component() {
        return this.children[0] || this.fireAncestors('$getChildComponent', {index: this.componentIndex});
    }

    _active() {
        this.create();
    }

    _inactive() {
        this._setState('');
        this.children[0].isAlive = true;
        this.fireAncestors('$childInactive', {child: this});
        this.childList.clear();
    }

    _getFocused() {
        return this.children && this.children[0] || this;
    }
}