export {default as CollectionWrapper} from './CollectionWrapper.js';
export {default as ItemWrapper} from './ItemWrapper.js';

export const limitWithinRange = (num, min, max) => {
    return Math.min(Math.max(num, min), max)
}

export const isFunction = value => {
    return typeof value === 'function'
}

export const isNumber = value => {
    return typeof value === 'number';
}

export const isInteger = value => {
    return (isNumber(value) && (value % 1) === 0);
}

export const isFloat = value => {
    return (isNumber(value) && (value % 1) !== 0);
}