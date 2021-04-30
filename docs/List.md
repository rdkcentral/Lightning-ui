# List

The List component provides a collection wrapper to display Items in either a Row or a Column. This component also comes with scrolling functionalities in case your collection of Items does not fit inside the bounds of the List.

## Usage

If you want to use the List component, import it from Lightning UI.

```js
import { List } from '@lightningjs/ui'
```

### Initialize

To use the List component you create an instance with the `type` List:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyList: {type: List}
        }
    }
}
```

You can pass additional parameters to your List, for example if you want your List to be displayed as a Row:

```js
{
    MyList: {
        type: List,
        direction: 'row'
    }
}
```

or if you want your List to be displayed as a Column:
```js
{
    MyList: {
        type: List,
        direction: 'column'
    }
}
```

## Available methods

### setIndex
You can set the index of the List by using the `setIndex` method: 
```js
this.tag('MyList').setIndex(index)
```
The parameter `index` should be a number starting from 0.

### add
You can add items to the List on the fly by using the `add` method:
```js
this.tag('MyList').add(items)
```
The parameter `items` can either be an array, object, string, or number.

### addAt
You can add items to the List at a starting from a specific index using the `addAt` method:
```js
this.tag('MyList').addAt(items, index)
```
The parameter `items` can either be an array, object, string, or number. The parameter `index` should be a number starting from 0.

### removeAt
You can remove item at a specific index by using the `removeAt` method:
```js
this.tag('MyList').removeAt(index)
```
The parameter `index` should be a number starting from 0.

### remove
You can let the List remove a specific item by using the `remove` method:
```js
this.tag('MyList').remove(item)
```
The parameter `item` should be a component that exists in the dataset of the List.

### clear
you can clear al existing items in the List by using the `clear` method:
```js
this.tag('MyList').clear()
```

## Setters

## Getters