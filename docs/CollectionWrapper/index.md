# Collection Wrapper

The Collection Wrapper is the base `class` for the List, Grid, and Carousel. The main purpose of the Collection Wrapper is to manage the Items that are added to the Collection Wrapper and provide necessary methods to manipulate these Items. The Collection Wrappers also makes sure that non-active Items are not always loaded in, through use of an ItemWrapper.

The List, Grid, and Carousel are extended from the Collection Wrapper in order to display data in their own specific way. The Collection Wrapper also features a default scroll functionality and the possibility to customize this.

## ItemWrapper
ItemWrappers are used to load the desired Item at a specific position. The ItemWrapper also makes sure the Item is unloaded when it has become `inactive`, and loaded again when its `active`.

## Items

### Basics
When we talk about Items, we talk about Buttons, Menu Items, Cells, Tiles, long story short: components to put into a collection. Generally when creating components in Lightning it looks something like this:

```js
{type: Item, w: 300, h: 200, ...properties}
```

This is also valid input if you want to add items to a List for example:
```js
this.tag('MyList').add([
    {type: Item, w: 300, h: 200, label: 'Search'},
    {type: Item, w: 300, h: 200, label: 'Home'},
    {type: Item, w: 300, h: 200, label: 'Photos'},
    {type: Item, w: 300, h: 200, label: 'Movies'}
])
```

With the Collection Wrapper you are not limited to one type of Item per collection but you can easily mix the height and width, because the Collection Wrapper will put it in the right position for you.

```js
this.tag('MyList').add([
    {type: Item, w: 300, h: 200, label: 'Search'},
    {type: ImageCell, w: 150, h: 200, imageSrc: 'my-image.jpg'},
    {type: MenuItem, w: 300, h: 50, label: 'Photos'},
    {type: Item, w: 300, h: 200, label: 'Movies'}
])
```

### Item Dimensions
When working with Item type components you generally have some basic widths and heights you use all the time. If you use specific `static` getters in your Item component you allow the Collection Wrapper to automatically incorperate these values:
```js
class myItemComponent extends Lightning.Component {
    static get width() {
        return 300
    }

    static get height() {
        return 200
    }
}
```

When you have added these `static` getters it allows you to add your Items to your List like this:
```js
this.tag('MyList').add([
    {type: myItemComponent, label: 'Search'},
    {type: myItemComponent, label: 'Home'},
    {type: myItemComponent, label: 'Photos'},
    {type: myItemComponent, label: 'Movies'}
])
```

### Item Positioning
Positioning for the Items is calculated automatically by the Collection Wrapper based on the width and height of the Item component(s), however there are some properties you can use to adjust the spacing between these Items. The easiest way is using the `spacing` setter:
```js
//in the template
{
    MyList: {type: List, spacing: 30}
}

//in methods
this.tag('MyList').spacing = 30
```

You can also use the following properties when adding your Items to adjust the spacing:
```js
this.tag('MyList').add([
    {
        type: Item,
        margin: 10, //spacing on all sides
        marginTop: 10, //spacing on the top
        marginRight: 10, //spacing on the right
        marginBottom: 10, //spacing on the bottom
        marginLeft: 10 //spacing on the left
    }
])
```

You can also add these properties as a `static` getter, just like with the width and height:
```js
class myItemComponent extends Lightning.Component {
    static get marginBottom() {
        return 30
    }

    static get marginRight() {
        return 40
    }
}
```

### Properties prioritization
At this point you might be wondering how the which property the Collection Wrapper will use if that specific property is used multiple times in the adding process.

1 - Check in the Item object ({type: Item, w, h, margin}).
2 - Check in the Item Component.
3 - Check in the Collection Wrapper for a fallback value.

### Setting up a fallback itemType
With the Collection Wrapper you can also set up a fallback ItemType which the Collection Wrapper needs to use when there is no type defined when adding a specific item. To do this you can address the following property:

```js
//in the template
{
    MyList: {type: List, itemType: MyItemComponent}
}

//in methods
this.tag('MyList').itemType = MyItemComponent
```

One of the perks of using this is that when you only use one specific Item type for one Collection wrapper, you can also use this method to clean up your `adding Items` part of the code a bit more:

```js
this.tag('MyList').itemType = MyItemComponent
this.tag('MyList').add([
    {label: 'Search'},
    {label: 'Home'},
    {label: 'Photos'},
    {label: 'Movies'}
])
```

### Item Object
As mentioned before, when you start adding Items to the Collection Wrapper your Item `object` looks something like this:
```js
{type: Item, w: 300, h: 200, ...properties}
```

For this Item `object` you can also just enter a string or a number, and the Collection Wrapper will normalize that value into an object it can work with. For example:
```js
this.tag('MyList').add([10, 'Banana'])
```

Normalizes to:
```js
this.tag('MyList').add(
    {label: '10'},
    {label: 'Banana'}
)
```

### Storing Item Data
The Collection Wrapper can store some data when an item becomes inactive, but to keep it to a minimum it only keeps track of properties of items that are used when you are initializing the item objects. This is handy when you have a specific value which can change during runtime. For example if an item was toggled:

```js
this.tag('MyList').add([
    {label: 'Search', toggled: true},
    {label: 'Home', toggled: false},
    {label: 'Photos', toggled: false},
    {label: 'Movies', toggled: false}
])
```

## Scrolling
The scrolling functionality is always in active by default, and main purpose of it is to always keep the current Item within the boundaries of the Collection Wrapper or anchored to a specific position.

### Boundaries
The boundaries we are using here depends on the `direction` that has been set earlier which by default is `row`. If the direction is `row` the main boundary will be the width, if the width has not been applied it will use `1920` as a fallback value. When the direction is `column` the main boundary will be the height, if there is no height, `1080` will be used as a fallback value.

### Customizing
You can customize the scroll functionality by using the setter `scroll`:

```js
this.tag('MyList').scroll = 90;
```

The input value for this property can be:

#### A value from 0.0 up to 1.0
The following value anchors the current item based on the items width / height and on the boundary of the Collection wrapper:

```js
this.tag('MyList').scroll = 0.5;
```
This example would always put the current item in the center.

#### A value starting from 1;
The following value anchors the current item X pixels from the left of the Collection Wrapper.

```js
this.tag('MyList').scroll = 90;
```
This example would always position the current Item 90 pixels from the left.

#### An object
The following value allows you to input an object as value which the Collection Wrapper can use to customize its default behaviour

```js
this.tag('MyList').scroll = {
    after: 3, //start scrolling after 3 items
    jump: 3, //after three items jump three Items
    forward: 0.9, //unless last item: scroll forward if item bounds are after 90% of the List, or if value is above 1; scroll after f.e. 900 pixels
    backward: 0.1, //unless first item: scroll backward if item bounds are before 10% of the List, or if value is above 1; scroll before f.e. 50 pixels
}
```

#### A function
You can also use a function as input, this way you can calulate the position yourself:

```js
this.tag('List').scroll = (itemWrapper, indexData) => {
    //calculation
    return 100 - itemWrapper.x
}
```
This example would always position the current Item 100 pixels from the left.

## Garbage Collection
On some platforms you may run into problems if the garbage collection is not called of not called enough. Lightning has a method you can call that can trigger the garbage collection:

```js
this.stage.gc()
```

To make the Collection Wrapper a bit more user friendly we built in a threshold that calls the garbage collector:

```js
//in the template
{
    MyGrid: {type: Grid, gcThreshold: 10}
}

//in methods
this.tag('MyGrid').gcThreshold = 10
```

This example will call the garbage collector every time 10 items have become inactive.

## Requests
Sometimes datasets are split in multiple pages, the Collection Wrapper allows you to set up a Paging functionality that starts requesting for data when you reach a specific point in the collection:

```js
//in the template
{
    MyGrid: {type: Grid, enableRequests: true, requestThreshold: 3}
}

//in methods
this.tag('MyGrid').enableRequests = true
this.tag('MyGrid').requestThreshold = 3
```
The example above shows the first step in setting the paging functionality, `enableRequests` activates it, and `requestThreshold` determines how many Items (With a Grid these are either `rows` or `columns`) before the end of the current Collection it should start requesting for items.

The Collection Wrapper requests for more items through the `signal` functionality in Lightning.

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyGrid: {type: Grid, signals: {onRequestItems: true}}
        }
    }

    onRequestItems(indexData) {
        return MyApiCall()
            .then((response) => {
                //return an array of Items or a single item.
                return reponse.items
            });
    }
}
```

## Signals
The Collection Wrapper makes use of signals if you want to respond to certain actions:
```js
//in template
{
    MyGrid: {type: Grid, signals: {onIndexChanged: true}}
}

onIndexChanged(indexData) {
    
}
```

If you have multiple Collection Wrappers in one view, you can rename the signal to something like this:
```js
//in template
{
    MyList: {type: List, signals: {onIndexChanged: 'listIndexChanged'}},
    MyGrid: {type: Grid, signals: {onIndexChanged: 'gridIndexChanged'}}
}

listIndexChanged(indexData) {
    
}
gridIndexChanged(indexData) {
    
}
```

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
This signal is fired when the Collection Wrapper is requesting for more data. This signal generally comes with the following object:
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


## Available methods

### add
You can add items to the Collection Wrapper on the fly by using the `add` method:
```js
this.tag('MyGrid').add(items)
```
The parameter `items` can either be an array, object, string, or number.

### addAt
You can add items to the Collection Wrapper at a starting from a specific index using the `addAt` method:
```js
this.tag('MyGrid').addAt(items, index)
```
The parameter `items` can either be an array, object, string, or number. The parameter `index` should be a number starting from 0.

### reload
You can reload the Collection Wrapper with a new set of items by using the `reload` method.
```js
this.tag('MyGrid').reload(items)
```
The parameter `items` can either be an array, object, string, or number. This method basically does a `clear` and `add`, in one call.

### removeAt
You can remove an Item at a specific index by using the `removeAt` method:
```js
this.tag('MyGrid').removeAt(index)
```
The parameter `index` should be a number starting from 0.

### remove
You can let the Collection Wrapper remove a specific item by using the `remove` method:
```js
this.tag('MyGrid').remove(item)
```
The parameter `item` should be a component that exists in the dataset of the Collection Wrapper.

### clear
You can clear al existing items in the Collection Wrapper by using the `clear` method:
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
You can set the index of the Collection Wrapper by using the `setIndex` method: 
```js
this.tag('MyGrid').setIndex(index)
```
The parameter `index` should be a number starting from 0.

### first
You can set the index to the first item in the Collection Wrapper by using the `first` method:
```js
this.tag('MyGrid').first()
```

### last
You can set the index to the last item in the Collection Wrapper by using the `last` method:
```js
this.tag('MyGrid').last()
```

### next
You can set the index to the next item in the Collection Wrapper by using the `next` method:
```js
this.tag('MyGrid').next()
```

### previous
You can set the index to the previous item in the Collection Wrapper by using the `previous` method:
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
You can attempt to navigate downwards by using the `down` method:
```js
this.tag('MyGrid').down()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### left
You can attempt to navigate left by using the `left` method:
```js
this.tag('MyGrid').left()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.

### right
You can attempt to navigate right by using the `right` method:
```js
this.tag('MyGrid').right()
```
This method returns `true` if the navigation was successful, or `false` if it was not successful.


## Setters

### direction
Sets the direction the Collection Wrapper starts building towards, this value should be `row` of `column`. Default and fallback value is `row`.

### forceLoad
Sets if the components that are added are force loaded, meaning they always exist as components and therefore might take up more memory than you would like. This value should be a `boolean`.

### spacing
Sets the fallback spacing between the items. Default value is 0(zero) `pixels`.

### itemType
Sets the default itemType the Collection Wrapper should use for the items. Expected input is a `Lightning.Component`.

### index
Sets the index of the Collection Wrapper. Expected input is a `number`.

### items
This setter `clears` the Collection Wrapper and `adds` the new Items to the Collection Wrapper. Expected input is an array, object, number, or string.

### scroll
Sets the scroll options for the Collection Wrapper. Expected input is a `float` starting from 0.0 until 1.0, a `number` representing pixels, an `object`, or a `function`.

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
Sets whether the bounds of the Collection Wrapper should resize to the size of the wrapper. Expected input is a `boolean`. Default value is `false`.

### enableRequests
Sets whether the Collection Wrapper should request for more data. Expected input is a `boolean`.

### requestThreshold
Sets how many Items before the end of the Collection Wrapper, the Collection Wrapper should start signaling for more data. Expected input is a `number`.

### gcThreshold
Sets how many Items should become inactive before the garbage collections is called. Expected input is a `number`.

## Getters

### direction
Returns the current `direction` in which the Collection Wrapper is being built.

### forceLoad
Returns the current `forceLoad` configuration the Collection Wrapper is using.

### spacing
Returns the current fallback `spacing` the Collection Wrapper is using.

### index
Returns the current `index` of the Collection Wrapper.

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
Returns the current `scrollTransition` of the Collection Wrapper.

### autoResize
Returns the current `autoResize` value.

### enableRequests
Returns the current `enableRequests` value.

### requestThreshold
Returns the current `requestThreshold` value.

### gcThreshold
Returns the current `gcThreshold` value.