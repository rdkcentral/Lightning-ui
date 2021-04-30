# List

The List component provides a collection wrapper to display Items in either a Row or a Column. This component also comes with scrolling functionalities in case your collection of Items does not fit inside the bounds of the List.

## Usage

If you want to use the List component, import it from Lightning UI.

```js
import { List } from '@lightningjs/sdk'
```

### initialize

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

You can pass additional parameters to your List:

```js
{
    MyList: {
        type: List,
        x,
        y   
    }
}
```

### adding Items

You can add Items to the List on the fly by using the `add` method:

```js
class MyApp extends Lightning.Application {
    _setup() {
        this.tag('MyList').add([
            {type: Item, w: 400, h: 300, label: '1'},
            {type: Item, w: 400, h: 300, label: '2'},
            {type: Item, w: 400, h: 300, label: '3'},
            {type: Item, w: 400, h: 300, label: '4'}
        ])
    }
}
```

### clear Items

you can clear al existing items in the List by using the `clear` method:

```js
class MyApp extends Lightning.Application {
    _inactive() {
        this.tag('MyList').clear()
    }
}
```




