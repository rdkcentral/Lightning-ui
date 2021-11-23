# Carousel

The Carousel component provides a Collection Wrapper to display Items in either a Row or a Column. What makes this component different from the List component is that it connects the end and start together, this way it appears to be going in a loop. This component is designed for finite collections.

## Usage

If you want to use the Carousel component, import it from Lightning UI.

```js
import { Carousel } from '@lightningjs/ui'
```

### Initialize

To use the Carousel component you create an instance with the `type` Carousel:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyCarousel: {type: Carousel}
        }
    }
}
```

You can pass additional parameters to your Carousel, for example if you want your Carousel to be displayed as a Row:

```js
{
    MyCarousel: {
        type: Carousel,
        direction: 'row'
    }
}
```

or if you want your Carousel to be displayed as a Column:
```js
{
    MyCarousel: {
        type: Carousel,
        direction: 'column'
    }
}
```

Please check the Setters for all available options.

## Available methods

### add
You can add items to the Carousel on the fly by using the `add` method:
```js
this.tag('MyCarousel').add(items)
```
The parameter `items` can either be an array, object, string, or number.

### addAt
You can add items to the Carousel at a starting from a specific index using the `addAt` method:
```js
this.tag('MyCarousel').addAt(items, index)
```
The parameter `items` can either be an array, object, string, or number. The parameter `index` should be a number starting from 0.

### reload
You can reload the Carousel with a new set of items by using the `reload` method.
```js
this.tag('MyCarousel').reload(items)
```
The parameter `items` can either be an array, object, string, or number. This method basically does a `clear` and `add`, in one call.

### removeAt
You can remove an Item at a specific index by using the `removeAt` method:
```js
this.tag('MyCarousel').removeAt(index)
```
The parameter `index` should be a number starting from 0.

### remove
You can let the Carousel remove a specific item by using the `remove` method:
```js
this.tag('MyCarousel').remove(item)
```
The parameter `item` should be a component that exists in the dataset of the Carousel.

### clear
You can clear al existing items in the Carousel by using the `clear` method:
```js
this.tag('MyCarousel').clear()
```

### reposition
You can reposition the itemWrappers when the items have been resized.
```js
//In the component where your Grid is initialized.
this.tag('MyCarousel').reposition()

//In a item component
this.collectionWrapper.reposition()
```

### setIndex
You can set the index of the Carousel by using the `setIndex` method: 
```js
this.tag('MyCarousel').setIndex(index)
```
The parameter `index` should be a number starting from 0.

### first
You can set the index to the first item in the Carousel by using the `first` method:
```js
this.tag('MyCarousel').first()
```

### last
You can set the index to the last item in the Carousel by using the `last` method:
```js
this.tag('MyCarousel').last()
```

### next
You can set the index to the next item in the Carousel by using the `next` method:
```js
this.tag('MyCarousel').next()
```

### previous
You can set the index to the previous item in the Carousel by using the `previous` method:
```js
this.tag('MyCarousel').previous()
```

### up
You can attempt to navigate upwards by using the `up` method:
```js
this.tag('MyCarousel').up()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### down
You can attempt to navigate downwards by using the `down` method:
```js
this.tag('MyCarousel').down()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### left
You can attempt to navigate left by using the `left` method:
```js
this.tag('MyCarousel').left()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### right
You can attempt to navigate right by using the `right` method:
```js
this.tag('MyCarousel').right()
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

### onItemsRepositioned
This signal is fired when the Items have been repositioned by the Carousel.

## Setters

### direction
Sets the direction the Carousel starts building towards, this value should be `row` of `column`. Default and fallback value is `row`.

### forceLoad
Sets if the components that are added are force loaded, meaning they always exist as components and therefore might take up more memory than you would like. This value should be a `boolean`.

### spacing
Sets the fallback spacing between the items. Default value is 0(zero) `pixels`.

### itemType
Sets the default itemType the Carousel should use for the items. Expected input is a `Lightning.Component`.

### index
Sets the index of the Carousel. Expected input is a `number`.

### items
This setter `clears` the Carousel and `adds` the new Items to the Carousel. Expected input is an array, object, number, or string.

### scroll
Sets the scroll options for the Carousel. Expected input is a `float` starting from 0.0 until 1.0, a `number` representing pixels, an `object`, or a `function`.

```js
this.tag('MyCarousel').scroll = 0.5 //anchor the scroll to center (0.5 === 50%)
this.tag('MyCarousel').scroll = 200 //anchor the scroll to 200 pixels

this.tag('MyCarousel').scroll = {
    after: 3, //start scrolling after 3 items
    jump: 3, //after three items jump three Items
    forward: 0.9, //unless last item: scroll forward if item bounds are after 90% of the List, or if value is above 1; scroll after f.e. 900 pixels
    backward: 0.1, //unless first item: scroll backward if item bounds are before 10% of the List, or if value is above 1; scroll before f.e. 50 pixels
}

this.tag('MyCarousel').scroll = (itemWrapper, indexData) => {
    //calculation
    return myCalculateValue
}
```

### scrollTransition
Sets the scrollTransition. A transtion `object` generally used in Lightning is expected here.

### autoResize
Sets whether the bounds of the Carousel should resize to the size of the wrapper. Expected input is a `boolean`. Default value is `false`.

### enableRequests
Sets whether the Carousel should request for more data. Expected input is a `boolean`.

### requestThreshold
Sets how many Items before the end of the Carousel, the Carousel should start signaling for more data. Expected input is a `number`.

### gcThreshold
Sets how many Items should become inactive before the garbage collections is called. Expected input is a `number`.

## Getters

### direction
Returns the current `direction` in which the Carousel is being built.

### forceLoad
Returns the current `forceLoad` configuration the Carousel is using.

### spacing
Returns the current fallback `spacing` the Carousel is using.

### index
Returns the current `index` of the Carousel.

### wrapper
Returns the wrapper in which the ItemWrappers are placed.

### itemWrappers
Returns the itemWrappers in which the Items are placed.

### items
Returns the current Itemset. If an Item is active as a component the component is returned.

### hasItems
Returns whether there are Items in the wrapper.

### length
Return the length of the Itemset.

### currentItem
Returns the current item that is located at the current `index`.

### currentItemWrapper
Returns the current ItemWrapper corresponding with currentItem.

### scrollTransition
Returns the current `scrollTransition` of the Carousel.

### autoResize
Returns the current `autoResize` value.

### enableRequests
Returns the current `enableRequests` value.

### requestThreshold
Returns the current `requestThreshold` value.

### gcThreshold
Returns the current `gcThreshold` value.