export { default as ItemWrapper } from './ItemWrapper.js';
export { default as KeyWrapper } from './KeyWrapper.js';
export { default as Cursor } from './Cursor.js';

export const limitWithinRange = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min), max);
}

export const findIndexOfObject = (array: Array<object>, search: any, targetProp: string) => {
    for(let i = 0; i < array.length; i++) {
        if(array[i][targetProp] === search) {
            return i;
        }
    }
    return -1;
}