# Grid

The Grid component provides a Collection Wrapper to display Items in either Rows or Columns.

## Usage

If you want to use the Grid component, import it from Lightning UI.

```js
import { Grid } from '@lightningjs/ui'
```

### Initialize

To use the Grid component you create an instance with the `type` Grid:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyGrid: {type: Grid}
        }
    }
}
```

You can pass additional parameters to your Grid, for example if you want your Grid to be displayed as 3 Rows:

```js
{
    MyGrid: {
        type: Grid,
        rows: 3
    }
}
```

or if you want your Grid to be displayed as 3 Columns:
```js
{
    MyGrid: {
        type: Grid,
        columns: 3
    }
}
```

If you use the `rows` or `columns`. It will automatically change the build direction to `row` or `column` respectively. You can still set up your Grid like you do with a List, that functionality allows you to make a mosaic grid, its your job however to calculate the proper widths and height of the items to make it look good.

Use the following code if you want something custom:

```js
{
    MyGrid: {
        type: Grid,
        direction: 'row'
    }
}
```

```js
{
    MyGrid: {
        type: Grid,
        direction: 'column'
    }
}
```

Please check the Setters for all available options.

## Available methods

### add
You can add items to the Grid on the fly by using the `add` method:
```js
this.tag('MyGrid').add(items)
```
The parameter `items` can either be an array, object, string, or number.

### addAt
You can add items to the Grid at a starting from a specific index using the `addAt` method:
```js
this.tag('MyGrid').addAt(items, index)
```
The parameter `items` can either be an array, object, string, or number. The parameter `index` should be a number starting from 0.

### removeAt
You can remove item at a specific index by using the `removeAt` method:
```js
this.tag('MyGrid').removeAt(index)
```
The parameter `index` should be a number starting from 0.

### remove
You can let the Grid remove a specific item by using the `remove` method:
```js
this.tag('MyGrid').remove(item)
```
The parameter `item` should be a component that exists in the dataset of the Grid.

### clear
You can clear al existing items in the Grid by using the `clear` method:
```js
this.tag('MyGrid').clear()
```

### reposition
You can reposition the itemWrappers when the items have been resized.
```js
//In the component where your Grid is initialized.
this.tag('MyGrid').reposition()

//In a item component
this.collectionWrapper.reposition()
```

### setIndex
You can set the index of the Grid by using the `setIndex` method: 
```js
this.tag('MyGrid').setIndex(index)
```
The parameter `index` should be a number starting from 0.

### first
You can set the index to the first item in the Grid by using the `first` method:
```js
this.tag('MyGrid').first()
```

### last
You can set the index to the last item in the Grid by using the `last` method:
```js
this.tag('MyGrid').last()
```

### next
You can set the index to the next item in the Grid by using the `next` method:
```js
this.tag('MyGrid').next()
```

### previous
You can set the index to the previous item in the Grid by using the `previous` method:
```js
this.tag('MyGrid').previous()
```

### up
You can attempt to navigate upwards by using the `up` method:
```js
this.tag('MyGrid').up()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### down
You can attempt to navigate upwards by using the `down` method:
```js
this.tag('MyGrid').down()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### left
You can attempt to navigate upwards by using the `left` method:
```js
this.tag('MyGrid').left()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### right
You can attempt to navigate upwards by using the `right` method:
```js
this.tag('MyGrid').right()
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
This signal is fired when the Grid is requesting for more data. This signal generally comes with the following object:
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
Sets the direction the Grid starts building towards, this value should be `row` of `column`. Default and fallback value is `row`.

### forceLoad
Sets if the components that are added are force loaded, meaning they always exist as components and therefore might take up more memory than you would like. This value should be a `boolean`.

### spacing
Sets the fallback spacing between the items. Default value is 0(zero) `pixels`.

### itemType
Sets the default itemType the Grid should use for the items. Expected input is a `Lightning.Component`.

### index
Sets the index of the Grid. Expected input is a `number`.

### items
This setter `clears` the Grid and `adds` the new Items to the Grid. Expected input is an array, object, number, or string.

### scroll
Sets the scroll options for the Grid. Expected input is a `float` starting from 0.0 until 1.0, a `number` representing pixels, an `object`, or a `function`.

```js
this.tag('MyGrid').scroll = 0.5 //anchor the scroll to center (0.5 === 50%)
this.tag('MyGrid').scroll = 200 //anchor the scroll to 200 pixels

this.tag('MyGrid').scroll = {
    after: 3, //start scrolling after 3 items
    jump: 3, //after three items jump three Items
    forward: 0.9, //unless last item: scroll forward if item bounds are after 90% of the List, or if value is above 1; scroll after f.e. 900 pixels
    backward: 0.1, //unless first item: scroll backward if item bounds are before 10% of the List, or if value is above 1; scroll before f.e. 50 pixels
}

this.tag('MyGrid').scroll = (itemWrapper, indexData) => {
    //calculation
    return myCalculateValue
}
```

### scrollTransition
Sets the scrollTransition. A transtion `object` generally used in Lightning is expected here.

### autoResize
Sets whether the bounds of the Grid should resize to the size of the wrapper. Expected input is a `boolean`. Default value is `false`.

### enableRequests
Sets whether the Grid should request for more data. Expected input is a `boolean`.

### requestThreshold
Sets how many items before the end of the Grid, the Grid should start signaling for more data. Expected input is a `number`.

### gcThreshold
Sets how many items should become inactive before the garbage collections is called. Expected input is a `number`.

## Getters

### direction
Returns the current `direction` in which the Grid is being built.

### forceLoad
Returns the current `forceLoad` configuration the Grid is using.

### spacing
Returns the current fallback `spacing` the Grid is using.

### index
Returns the current `index` of the Grid.

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
Returns the current `scrollTransition` of the Grid.

### autoResize
Returns the current `autoResize` value.

### enableRequests
Returns the current `enableRequests` value.

### requestThreshold
Returns the current `requestThreshold` value.

### gcThreshold
Returns the current `gcThreshold` value.