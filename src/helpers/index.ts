export { default as ItemWrapper } from './ItemWrapper.js';
export { default as KeyWrapper } from './KeyWrapper.js';
export { default as Cursor } from './Cursor.js';
export { default as CollectionWrapper } from './CollectionWrapper.js';

export function limitWithinRange(num: number, min: number, max: number) : number {
    return Math.min(Math.max(num, min), max);
}

export interface Prop {
    [key: string]: any;
}

export function findIndexOfObject(array: Array<object>, search: any, targetProp: string) : number {
    type extractFrom = Extract<keyof Prop, object>;
    for(let i = 0; i < array.length; i++) {
        if((array[i] as extractFrom)[targetProp] === search) {
            return i;
        }
    }
    return -1;
}

export function toArray<X>(xs: Iterable<X>) : X[] {
    return [...xs];
}

export enum Direction {
    row = 0,
    column = 1
}

export function getDirectionByValue(value: number): keyof typeof Direction {
    for(const key in Direction) {
        if(Direction[key as keyof typeof Direction] === value) {
            return key as keyof typeof Direction;
        }
    }
    return 'row';
}

export function getDirection(value: string): number {
    return Direction[value as keyof typeof Direction] ?? Direction.row;
}