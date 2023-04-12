import Lightning from '@lightningjs/core';
import type { ItemSizes, ItemType } from './CollectionWrapper';

export interface ItemWrapperTemplateSpec extends Lightning.Component.TemplateSpec {
    [key: string]: any,
    margin?: number,
    marginTop?: number,
    marginBottom?: number,
    marginRight?: number,
    marginLeft?: number,
    assignedX?: number,
    assignedY?: number,
    componentIndex: number,
    forceLoad?: boolean
    component: Lightning.Component
}

export default class ItemWrapper
    extends Lightning.Component<ItemWrapperTemplateSpec>
    implements Lightning.Component.ImplementTemplateSpec<ItemWrapperTemplateSpec>
{
    forceLoad = false;
    componentIndex = -1;

    assignedX = 0;
    assignedY = 0;

    static override _template(): Lightning.Component.Template<ItemWrapperTemplateSpec> {
        return {
            clipbox: true
        }
    }

    override _setup() {
        if(this.forceLoad) {
            this.create();
        }
    }

    override _active() {
        this.create();
    }

    override _inactive() {
        if(!this.forceLoad) {
            (this.children[0] as unknown as ItemType)!.isAlive = false;
            this.fireAncestors('$childInactive', {child: this});
            this.childList.clear();
        }
    }

    override _getFocused() {
        return (this.children && this.children[0] || this) as Lightning.Component;
    }

    private create() {
        if(this.children.length > 0) {
            return;
        }
        const component = this.fireAncestors('$getChildComponent', {index: this.componentIndex}) as unknown as ItemType;
        component.isAlive = true;
        const {w, h, margin, marginTop, marginBottom, marginRight, marginLeft} = this as unknown as ItemSizes;
        this.children = [{...component, w, h, margin, marginTop, marginRight, marginLeft, marginBottom}];
        if(this.hasFocus()) {
            this._refocus();
        }
    }

    get component() {
        return (this.children[0] || this.fireAncestors('$getChildComponent', {index: this.componentIndex})) as Lightning.Component;
    }
}