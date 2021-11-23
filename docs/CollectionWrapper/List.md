# List

The List component provides a Collection Wrapper to display Items in either a Row or a Column

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

Please check the Setters for all available options.

## Available methods

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
You can clear al existing items in the List by using the `clear` method:
```js
this.tag('MyList').clear()
```

### reposition
You can reposition the itemWrappers when the items have been resized.
```js
//In the component where your List is initialized.
this.tag('MyList').reposition()

//In a item component
this.collectionWrapper.reposition()
```

### setIndex
You can set the index of the List by using the `setIndex` method: 
```js
this.tag('MyList').setIndex(index)
```
The parameter `index` should be a number starting from 0.

### first
You can set the index to the first item in the List by using the `first` method:
```js
this.tag('MyList').first()
```

### last
You can set the index to the last item in the List by using the `last` method:
```js
this.tag('MyList').last()
```

### next
You can set the index to the next item in the List by using the `next` method:
```js
this.tag('MyList').next()
```

### previous
You can set the index to the previous item in the List by using the `previous` method:
```js
this.tag('MyList').previous()
```

### up
You can attempt to navigate upwards by using the `up` method:
```js
this.tag('MyList').up()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### down
You can attempt to navigate upwards by using the `down` method:
```js
this.tag('MyList').down()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### left
You can attempt to navigate upwards by using the `left` method:
```js
this.tag('MyList').left()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### right
You can attempt to navigate upwards by using the `right` method:
```js
this.tag('MyList').right()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.


## Signals

### onIndexChanged
This signal is fired when the index has changed. This signal generally comes with the following object:
```js
{
    index,
    previousIndex,
    dataLength
}
```

### onRequestItems
This signal is fired when the List is requesting for more data. This signal generally comes with the following object:
```js
{
    index,
    previousIndex,
    dataLength
}
```
This signal requires you to return a promise that returns either Item, or if there are no Item you should return `false`. If you return `false` the enableRequest will be automatically changed to `false` aswell.

### onItemsRepositioned
This signal is fired when the Items have been repositioned by the Collection Wrapper.


## Setters

### direction
Sets the direction the List starts building towards, this value should be `row` of `column`. Default and fallback value is `row`.

### forceLoad
Sets if the components that are added are force loaded, meaning they always exist as components and therefore might take up more memory than you would like. This value should be a `boolean`.

### spacing
Sets the fallback spacing between the items. Default value is 0(zero) `pixels`.

### itemType
Sets the default itemType the List should use for the items. Expected input is a `Lightning.Component`.

### index
Sets the index of the List. Expected input is a `number`.

### items
This setter `clears` the List and `adds` the new Items to the List. Expected input is an array, object, number, or string.

### scroll
Sets the scroll options for the List. Expected input is a `float` starting from 0.0 until 1.0, a `number` representing pixels, an `object`, or a `function`.

```js
this.tag('MyList').scroll = 0.5 //anchor the scroll to center (0.5 === 50%)
this.tag('MyList').scroll = 200 //anchor the scroll to 200 pixels

this.tag('MyList').scroll = {
    after: 3, //start scrolling after 3 items
    jump: 3, //after three items jump three Items
    forward: 0.9, //unless last item: scroll forward if item bounds are after 90% of the List, or if value is above 1; scroll after f.e. 900 pixels
    backward: 0.1, //unless first item: scroll backward if item bounds are before 10% of the List, or if value is above 1; scroll before f.e. 50 pixels
}

this.tag('MyList').scroll = (itemWrapper, indexData) => {
    //calculation
    return myCalculateValue
}
```

### scrollTransition
Sets the scrollTransition. A transtion `object` generally used in Lightning is expected here.

### autoResize
Sets whether the bounds of the List should resize to the size of the wrapper. Expected input is a `boolean`. Default value is `false`.

### enableRequests
Sets whether the List should request for more data. Expected input is a `boolean`.

### requestThreshold
Sets how many items before the end of the List, the List should start signaling for more data. Expected input is a `number`.

### gcThreshold
Sets how many items should become inactive before the garbage collections is called. Expected input is a `number`.

## Getters

### direction
Returns the current `direction` in which the List is being built.

### forceLoad
Returns the current `forceLoad` configuration the List is using.

### spacing
Returns the current fallback `spacing` the List is using.

### index
Returns the current `index` of the List.

### wrapper
Returns the wrapper in which the ItemWrappers are placed.

### itemWrappers
Returns the itemWrappers in which the items are placed.

### items
Returns the current item set. If an item is active as a component the component is returned.

### hasItems
Returns whether there are items in the wrapper.

### length
Return the length of the items dataset.

### currentItem
Returns the current item that is located at the current `index`.

### currentItemWrapper
Returns the current item wrapper corresponding with currentItem.

### scrollTransition
Returns the current `scrollTransition` of the List.

### autoResize
Returns the current `autoResize` value.

### enableRequests
Returns the current `enableRequests` value.

### requestThreshold
Returns the current `requestThreshold` value.

### gcThreshold
Returns the current `gcThreshold` value.