# ScrollBar

The ScrollBar component allows you to display a Scroll bar in your app and customize it in a few minutes.

## Usage

If you want to use the ScrollBar component, import it from Lightning UI.

```js
import { ScrollBar } from '@lightningjs/ui'
```

### Initialize

To use the ScrollBar component you create an instance with the `type` ScrollBar:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyScrollBar: {
                type: ScrollBar, 
                x: 1760,
                y: 0,
                w: 10,
                h: 720,
            },
        }
    }
}
```
## Customizing

You can use a bunch of setters to customize your scroll bar listed below.

## Setters

###colors
Sets the colors like background color of scrollBar & colors for scroller focused and unfocused states. Expected input is an `object` with properties of background, scrollerFocused & scrollerUnfocused. Default value of colors is given below.
```js
{
    background: 0xffd8d8d8,
    scrollerFocused: 0xff00a7e3,
    scrollerUnfocused: 0xff606060,
}
```

###direction
Sets the direction of the scrollBar. Expected input is a `string` of either `vertical` or `horizontal`. Default value for direction is `vertical`.

###totalNumOfScrolls
Sets the total number of possible scrolls for the scrollBar. Expected input is a `number`.

## Getters

###colors
returns the current colors object of the scrollbar

###direction
returns the current direction of the scrollbar

###totalNumOfScrolls
returns the current number of possible scrolls available for the view. 

