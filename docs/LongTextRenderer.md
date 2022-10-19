# LongTextRenderer

The LongTextRenderer component allows you to display a textview along with scroll bar for lengthy texts in your app and customize it in a few minutes.

## Usage

If you want to use the LongTextRenderer component, import it from Lightning UI.

```js
import { LongTextRenderer } from '@lightningjs/ui'
```

### Initialize

To use the LongTextRenderer component you create an instance with the `type` LongTextRenderer:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            TextArea: {
                type: LongTextRenderer,
                h: 800,
                w: 1500
            },
        }
    }
}
```

## Customizing

By default, the LongTextRenderer looks very standard, for this reason we added some setters in order for you to easily customize your LongTextRenderer.

## Methods

###reset
clears the Description children from the TextArea tag

## Setters

###textProps

If you want to change anything related to the paragraph text you can use the `textProps` as shown in below example

```js
{
    TextArea: {
        w: 1500,
        h: 900,
        type: LongTextRenderer,
        textProps: {
            textAlign: 'left',
            fontFace: 'Roboto',
            fontSize: 22,
            lineHeight: 40,
            wordWrapWidth: 780,
            textColor: 0xff606060,
        }
    }
}
```

###scrollBarProps

If you want to change anything related to the scrollbar you can use the `scrollBarProps` as shown in below example

```js
{
    TextArea: {
        w: 1500,
        h: 900,
        type: LongTextRenderer,
        scrollBarProps: {
            x: 1600,
            y: 0,
            w: 10,
            h: 780,
            colors: {
                background: 0xffd8d8d8,
                scrollerFocused: 0xff00a7e3,
                scrollerUnfocused: 0xff606060,
            },
        },
    }
}
```

###description
sets the value of `description`. Expected input is a `string`.

###scrollPercentage
sets the value of `scrollPercentage`. Expected input is a `number` from 1 to 100 bases on how much percentage of view need to be scrolled per each scroll. Default scrollPercentage is 80%.

## Getters

###textProps
Returns the current text properties of TextArea

###scrollBarProps
Returns the current properties of Scrollbar

###description
Returns the current description

###scrollPercentage
Returns the current scroll percentage of the text view


