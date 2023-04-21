import Lightning from '@lightningjs/core';

import {
    Direction,
    getDirection,
    getDirectionByValue,
    ItemWrapper,
    limitWithinRange,
} from './index.js';

export interface CollectionWrapperTemplateSpec extends Lightning.Component.TemplateSpec {
    direction?: string,
    spacing?: number,
    autoResize?: boolean,
    requestThreshold?: number,
    enableRequests?: boolean,
    forceLoad?: boolean,
    itemType?: Lightning.Component,
    scroll?: number | object | Function | undefined,
    Wrapper: object
}

export interface IndexChangedEvent {
    previousIndex: number,
    index: number,
    dataLength: number,
    mainIndex?: number,
    crossIndex?: number,
    previousMainIndex?: number,
    previousCrossIndex?: number,
    lines?: number
}

export interface RequestItemsEvent {
    previous: number,
    index: number,
    max: number
}

export interface ChildInactiveEvent {
    child: ItemWrapper
}

export interface GetChildComponentEvent {
    index: number
}

export interface ItemType {
    [key: string]: any,
    assignedID: string,
    type?: Lightning.Component,
    collectionWrapper: CollectionWrapper,
    isAlive: boolean
}

export interface Items<T> extends Array<T> {
    [key: number]: T
}

export interface ItemSizes {
    [key: string]: number | undefined,
    w: number,
    h: number,
    margin: number,
    marginLeft?: number,
    marginRight?: number,
    marginTop?: number,
    marginBottom?: number,
}

export interface PlotProperties {
    [key: string]: string | boolean,
    directionIsRow: boolean,
    mainDirection: 'rows' | 'columns',
    main: 'x' | 'y',
    mainDim: 'w' | 'h',
    mainMarginTo: 'marginRight' | 'marginBottom',
    mainMarginFrom: 'marginLeft' | 'marginTop',
    crossDirection: 'columns' | 'rows',
    cross: 'y' | 'x',
    crossDim: 'h' | 'w',
    crossMarginTo: 'marginBottom' | 'marginRight',
    crossMarginFrom: 'marginTop' | 'marginLeft',
}

export interface ScrollOptions {
    jump?: number,
    after?: number,
    backward?: number,
    forward?: number
}

type addItems = string | number | object | object[];

interface UniqueIDs {
    [key: string]: boolean;
}

export interface CollectionWrapperSignalMap extends Lightning.Component.SignalMap {
    onIndexChanged(event: IndexChangedEvent): void,
    onRequestItems(event: RequestItemsEvent): Promise<Array<object> | object | string | number>,
    onItemsRepositioned(): void
}

export interface CollectionWrapperTypeConfig extends Lightning.Component.TypeConfig {
    SignalMapType: CollectionWrapperSignalMap
}

export default class CollectionWrapper<
    TemplateSpec extends CollectionWrapperTemplateSpec = CollectionWrapperTemplateSpec,
    TypeConfig extends CollectionWrapperTypeConfig = CollectionWrapperTypeConfig
>
    extends Lightning.Component<TemplateSpec, TypeConfig>
    implements Lightning.Component.ImplementTemplateSpec<CollectionWrapperTemplateSpec>
{
    Wrapper = (this as CollectionWrapper).getByRef('Wrapper')! as Lightning.Element;

    protected _scrollTransitionSettings = this.stage.transitions.createSettings({});
    protected _spacing: number = 0;
    protected _autoResize: boolean = false;

    protected _requestingItems: boolean = false;
    protected _requestThreshold: number = 1;
    protected _requestsEnabled: boolean = false;

    protected _gcThreshold: number = 5;
    protected _gcIncrement: number = 0;
    protected _forceLoad: boolean = false;

    protected _uids: UniqueIDs = {};
    protected _items: Items<ItemType> = [];
    protected _index: number = 0;
    protected _scroll: number | object | Function | undefined = undefined;

    protected _itemType: Lightning.Component | undefined = undefined;
    protected _scrollTransition: Lightning.types.Transition | null = null;
    protected _repositionDebounce: number | null = null;

    protected _direction = Direction.row;

    static override _template(): Lightning.Component.Template<CollectionWrapperTemplateSpec> {
        return {
            Wrapper: {}
        }
    }

    override _construct() {
        this._scrollTransitionSettings = this.stage.transitions.createSettings({});
        this.clear();
    }

    override _setup() {
        this._updateScrollTransition();
    }

    override _getFocused() {
        return (this.hasItems && this.currentItemWrapper || this) as Lightning.Component;
    }

    override _handleRight() {
        return this.right()
    }

    override _handleLeft() {
        return this.left()
    }

    override _handleUp() {
        return this.up();
    }

    override _handleDown() {
        return this.down();
    }

    override _inactive() {
        if(this._repositionDebounce) {
            clearTimeout(this._repositionDebounce);
        }
        this._collectGarbage(true);
    }

    _updateScrollTransition() {
        const axis = this._direction === 1 ? 'y' : 'x';
        this.Wrapper.transition(axis, this._scrollTransitionSettings);
        this._scrollTransition = this.Wrapper.transition(axis);
    }

    _resizeWrapper(crossSize: object | number) {
        let obj = crossSize;
        if(typeof crossSize === 'number') {
            const {main, mainDim, crossDim} = this._getPlotProperties(this._direction);
            const lastItem = this.wrapper.children[this.wrapper.children.length-1];
            obj = {
                [mainDim]: lastItem![main] + lastItem![mainDim],
                [crossDim]: crossSize
            }
        }
        obj = obj as object;
        this.wrapper.patch(obj);
        if(this._autoResize) {
            this.patch(obj);
        }
    }

    _indexChanged(obj: IndexChangedEvent) {
        let previous = obj.previousMainIndex ?? obj.previousIndex;
        let target = obj.mainIndex ?? obj.index;
        let max = obj.lines ?? obj.dataLength;

        if (this._requestsEnabled && !this._requestingItems) {
            if (target + this._requestThreshold >= max) {
                this.requestItems(false, {
                    previous,
                    index: target,
                    max
                });
            }
        }
        this._refocus();
        this.scrollCollectionWrapper(obj);

        if (obj.previousIndex !== obj.index) {
            (this as CollectionWrapper).signal('onIndexChanged', obj);
        }
    }

    requestItems(reload?: boolean, obj?: RequestItemsEvent) {
        reload = reload ?? false;
        obj = obj ?? {
            previous: 0,
            index: 0,
            max: 0
        }
        this._requestingItems = true;
        (this as CollectionWrapper).signal('onRequestItems', obj)
            .then((response: any) => {
                if (response === false) {
                    this._requestsEnabled = false;
                }
                this._requestingItems = false;
                if(reload) {
                    this.clear();
                }
                const type = typeof response;
                if (Array.isArray(response) || type === 'object' ||  type === 'string' || type === 'number') {
                    this.add(response);
                }
            })
    }

    setIndex(index: number) {
        const targetIndex = limitWithinRange(index, 0, this._items.length - 1);
        const previousIndex = this._index;
        this._index = targetIndex;
        this._indexChanged({ previousIndex, index: targetIndex, dataLength: this._items.length });
        return previousIndex !== targetIndex;
    }

    clear() {
        this._uids = {};
        this._items = [];
        this._index = 0;
        if(this._scrollTransition) {
            this._scrollTransition.reset(0, 1);
        }
        if(this.Wrapper) {
            const hadChildren = this.Wrapper.children.length > 0;
            this.Wrapper.patch({
                x: 0, y: 0, children: []
            });
            if(hadChildren) {
                this._collectGarbage(true);
            }
        }
    }
    
    override add<T extends addItems>(
        element: T,
    ): T;
    override add<T extends Lightning.Component.Constructor>(element: Lightning.Element.NewPatchTemplate<T>): InstanceType<T>;
    override add(
        element: Array<Lightning.Element.NewPatchTemplate | Element>,
    ): void;
    override add(element: addItems) : void {
        this.addAt(element);
    }

    addAt(item: any, index?: number) {
        index = index ?? this._items.length;
        if(index >= 0 && index <= this._items.length) {
            if(!Array.isArray(item)) {
                item = [item];
            }
            const items = this._normalizeDataItems(item);
            this._items.splice(index, 0, ...items);
            this.plotItems();
            this.setIndex(this._index);
        }
        else {
            throw new Error('addAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
    }

    remove(target: any) {
        if(this.hasItems && target.assignedID) {
            const itemWrappers = this.itemWrappers;
            for(let i = 0; i < this._items.length; i++) {
                let item: any = this._items[i];
                if(itemWrappers[i] && itemWrappers[i].component.isAlive) {
                    item = itemWrappers[i].component;
                }
                if(target.assignedID === item.assignedID) {
                    return this.removeAt(i);
                }
            }
        }
        else {
            throw new Error('remove: item not found');
        }
    }

    removeAt(index: number, amount?: number) {
        if(index < 0 && index >= this._items.length) {
            throw new Error('removeAt: The index ' + index + ' is out of bounds ' + this._items.length);
        }
        amount = amount ?? 1;
        const item = this._items[index];
        this._items.splice(index, amount);
        this.plotItems();
        return item;
    }

    reload(items: addItems) {
        this.clear();
        this.add(items);
    }

    plotItems() {
        //placeholder
    }

    reposition(time = 70) {
        if(this._repositionDebounce) {
            clearTimeout(this._repositionDebounce);
        }
        this._repositionDebounce = setTimeout(() => {
            this.repositionItems();
        }, time) as unknown as number;
    }

    repositionItems() {
        //placeHolder
        (this as CollectionWrapper).signal('onItemsRepositioned')
    }

    navigate(shift: number, direction?:number) {
        direction = direction ?? this._direction;
        if(direction !== this._direction) {
            return false;
        }
        return this.setIndex(this._index + shift);
    }

    scrollCollectionWrapper(obj: IndexChangedEvent) {
        let previous = obj.previousMainIndex ?? obj.previousIndex;
        let target = obj.mainIndex ?? obj.index;
        let max = obj.lines ?? obj.dataLength;

        const {directionIsRow, main, mainDim, mainMarginFrom, mainMarginTo} = this._getPlotProperties(this._direction);
        const cw = this.currentItemWrapper;
        let bound = this[mainDim];
        if(bound === 0) {
            bound = directionIsRow ? 1920 : 1080;
        }
        const offset = Math.min(this.wrapper[main], this._scrollTransition && this._scrollTransition.targetValue || 0);

        const sizes = this._getItemSizes(cw);
        const marginFrom = (sizes[mainMarginFrom] || sizes.margin || 0);
        const marginTo = (sizes[mainMarginTo] || sizes.margin || 0);

        let scroll = this._scroll;

        if(typeof scroll === 'number') {
            if(scroll >= 0 && scroll <= 1) {
                scroll = bound * scroll - (cw[main] + cw[mainDim] * scroll);
            }
            else {
                scroll = scroll - cw[main];
            }
        }
        else if(typeof scroll === 'function') {
            scroll = scroll.apply(this, [cw, obj]);
        }
        else if(typeof scroll === 'object') {
            const {jump = 0, after = 0, backward = 0.0, forward = 1.0} = scroll as ScrollOptions;
            if(jump) {
                let mod = target % jump;
                if(mod === 0) {
                    scroll = marginFrom - cw[main];
                }
                if(mod === jump - 1) {
                    const actualSize = marginFrom + cw[mainDim] + marginTo;
                    scroll = (mod * actualSize) + marginFrom - cw[main];
                }
            }
            else if(after) {
                scroll = 0;
                if(target >= after - 1) {
                    const actualSize = marginFrom + cw[mainDim] + marginTo;
                    scroll = ((after - 1) * actualSize) + marginFrom - cw[main];
                }
            }
            else {
                const backwardBound = bound * this._normalizePixelToPercentage(backward, bound);
                const forwardBound = bound * this._normalizePixelToPercentage(forward, bound);
                if(target < max - 1 && (previous < target && offset + cw[main] + cw[mainDim] > forwardBound)) {
                    scroll = forwardBound - (cw[main] + cw[mainDim]);
                }
                else if(target > 0 && (target < previous && offset + cw[main] < backwardBound)) {
                    scroll = backwardBound - cw[main];
                }
                else if(target === max - 1) {
                    scroll = bound - (cw[main] + cw[mainDim]);
                }
                else if(target === 0) {
                    scroll = marginFrom - cw[main];
                }
            }
        }
        else if(scroll === undefined){
            if(previous < target && offset + cw[main] + cw[mainDim] > bound) {
                scroll = bound - (cw[main] + cw[mainDim])
            }
            else if(target < previous && offset + cw[main] < 0) {
                scroll = marginFrom - cw[main]
            }
        }

        if(this.active && typeof scroll === 'number' && this._scrollTransition) {
            if(this._scrollTransition.isRunning()) {
                this._scrollTransition.reset(scroll, 0.05);
            }
            else {
                this._scrollTransition.start(scroll);
            }
        }
        else if(typeof scroll === 'number') {
            this.wrapper[main] = scroll
        }
    }

    $childInactive(event: ChildInactiveEvent) {
        let child = event.child;
        const index = child.componentIndex;
        for(let key in this._items[index]) {
            const comp = child.component as unknown as ItemType;
            if(comp[key] !== undefined) {
                this._items[index]![key] = comp[key];
            }
        }
        this._collectGarbage();
    }

    $getChildComponent(event: GetChildComponentEvent) {
        return this._items[event.index];
    }

    up() {
        return this._attemptNavigation(-1, 1);
    }

    down() {
        return this._attemptNavigation(1, 1);
    }

    left() {
        return this._attemptNavigation(-1, 0);
    }

    right() {
        return this._attemptNavigation(1, 0);
    }

    first() {
        return this.setIndex(0);
    }

    last() {
        return this.setIndex(this._items.length - 1);
    }

    next() {
        return this.setIndex(this._index + 1);
    }

    previous() {
        return this.setIndex(this._index - 1);
    }

    _attemptNavigation(shift: number, direction: number) {
        if(this.hasItems) {
            return this.navigate(shift, direction);
        }
        return false;
    }

    _generateUniqueID() {
        let id = '';
        while(this._uids[id] || id === '') {
            id = Math.random().toString(36).substr(2, 9);
        }
        this._uids[id] = true;
        return id;
    }

    _normalizeDataItems(array: object[]) {
        const results = array.map((item, index) => {
            return this._normalizeDataItem(item) || index;
        })
        .filter((item) => {
            if(typeof item === 'number') {
                console.warn(`Item at index: ${item}, is not a valid item. Removing it from dataset`);
                return false;
            }
            return true;
        });
        return results as Items<ItemType>
    }

    _normalizeDataItem(item: string | number | object): undefined | ItemType {
        if(typeof item === 'string' || typeof item === 'number') {
            item = {label: item.toString()}
        }
        if(typeof item === 'object') {
            let id = this._generateUniqueID();
            const itemType: ItemType = {
                assignedID: id,
                collectionWrapper: this as CollectionWrapper,
                isAlive: false, ...item
            }
            if(this._itemType) {
                itemType.type = this._itemType;
            }
            return itemType
        }
        return undefined;
    }

    _getPlotProperties(direction: number) : PlotProperties {
        const directionIsRow = direction === 0;
        if(directionIsRow) {
            return {
                directionIsRow: true,
                mainDirection: 'rows',
                main: 'x',
                mainDim: 'w',
                mainMarginTo: 'marginRight',
                mainMarginFrom: 'marginLeft',
                crossDirection: 'columns',
                cross: 'y',
                crossDim: 'h',
                crossMarginTo: 'marginBottom',
                crossMarginFrom: 'marginTop'
            }
        }
        return {
            directionIsRow: true,
            mainDirection: 'columns',
            main: 'y',
            mainDim: 'h',
            mainMarginTo: 'marginBottom',
            mainMarginFrom: 'marginTop',
            crossDirection: 'rows',
            cross: 'x',
            crossDim: 'w',
            crossMarginTo: 'marginRight',
            crossMarginFrom: 'marginLeft'
        }
    }

    _getItemSizes(item: any) {
        const itemType = item.type;
        if(item.component && item.component.__attached) {
            item = item.component;
        }
        const result: ItemSizes = {
            w: item.w || (itemType && itemType['width']),
            h: item.h || (itemType && itemType['height']),
            margin: item.margin || (itemType && itemType['margin']) || 0,
            marginLeft: item.marginLeft || (itemType && itemType['marginLeft']),
            marginRight: item.marginRight || (itemType && itemType['marginRight']),
            marginTop: item.marginTop || (itemType && itemType['marginTop']),
            marginBottom: item.marginBottom || (itemType && itemType['marginBottom'])
        }
        return result;
    }

    _normalizePixelToPercentage(value: number, max: number) {
        if(value && value > 1) {
            return value / max;
        }
        return value || 0;
    }

    protected _collectGarbage(immediate?: boolean) {
        this._gcIncrement++;
        if(immediate || (this.active && this._gcThreshold !== 0 && this._gcIncrement >= this._gcThreshold)) {
            this._gcIncrement = 0;
            this.stage.gc();
        }
    }

    static get itemType() {
        return undefined;
    }

    set forceLoad(bool) {
        this._forceLoad = bool;
    }

    get forceLoad() {
        return this._forceLoad;
    }

    get requestingItems() {
        return this._requestingItems;
    }

    set requestThreshold(num: number) {
        this._requestThreshold = num;
    }

    get requestThreshold() {
        return this._requestThreshold;
    }

    set enableRequests(bool) {
        this._requestsEnabled = bool
    }

    get enableRequests() {
        return this._requestsEnabled
    }

    set gcThreshold(num) {
        this._gcThreshold = num;
    }

    get gcThreshold() {
        return this._gcThreshold;
    }

    get wrapper() {
        return this.Wrapper;
    }

    get hasItems() : boolean {
        return this.wrapper && this.wrapper.children && this.wrapper.children.length > 0;
    }

    get currentItemWrapper() : ItemWrapper {
        return this.wrapper.children[this._index] as ItemWrapper;
    }

    get currentItem() : Lightning.Component {
        return this.currentItemWrapper && this.currentItemWrapper.component as Lightning.Component;
    }

    set direction(str: string) {
        this._direction = getDirection(str) as number;
    }

    get direction() : string {
        return getDirectionByValue(this._direction);
    }

    set items(array) {
        this.clear();
        this.add(array);
    }

    get items() {
        const itemWrappers = this.itemWrappers;
        return this._items.map((item, index) => {
            if(itemWrappers[index] && itemWrappers[index].component.isAlive) {
                return itemWrappers[index].component;
            }
            return item;
        });
    }

    get length() : number {
        return this._items.length;
    }

    set index(index) {
        this.setIndex(index);
    }

    get itemWrappers() : any {
        return this.wrapper.children;
    }

    get index() : number{
        return this._index;
    }

    set scrollTransition(obj: Lightning.types.TransitionSettings) {
        this._scrollTransitionSettings!.patch(obj);
        if(this.active) {
            this._updateScrollTransition();
        }
    }

    get scrollTransition() : Lightning.types.TransitionSettings{
        return this._scrollTransitionSettings;
    }

    set scroll(value) {
        this._scroll = value;
    }

    get scroll() : number | object | Function | undefined {
        return this._scroll;
    }

    set autoResize(bool) {
        this._autoResize = bool;
    }

    get autoResize() : boolean {
        return this._autoResize;
    }

    set spacing(num) {
        this._spacing = num;
    }

    get spacing() : number {
        return this._spacing;
    }

    set itemType(comp: Lightning.Component | undefined) {
        this._itemType = comp;
    }

    get itemType() : Lightning.Component | undefined {
        return this._itemType;
    }

}