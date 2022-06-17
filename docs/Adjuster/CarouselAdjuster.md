# ArrowAdjuster

The ArrowAdjuster is an extension of the Adjuster component, this component components shows all options in a carousel.

## Usage

If you want to use the CarouselAdjuster component, import it from Lightning UI.

```js
import { CarouselAdjuster } from '@lightningjs/ui'
```

### Initialize

To use the CarouselAdjuster component you create an instance with the `type` CarouselAdjuster:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyCarouselAdjuster: {
                type: CarouselAdjuster
            },
        }
    }
}
```

## Customize

You can view the [Adjuster](../index.md) component page to see more information about customizing.

### Patching Template
You can always add / customize existing tags, to make this job a bit easier follow this template when altering the component:

```js
this.tag('MyAdjuster').patch({
    Focus: {},
    Label: {},
    ValueWrapper: {
        Carousel: {}
    }
});
```

## Setters

### label
With this setter you can change the value of the Label tag. Expected input is an `string` or `number`.

### options
With this setter you can add options instead of a range of numbers. Expected input is an `array`.

### value
With this setter you can change the index of the carousel. Expected input is a `number` / `index`.

### focusColor
With this setter you can set the focus color of the rounded rectangle where the value is displayed. Expected input is an `argb`.

### labelColor
With this setter you can set the color of all the labels. Expected input is an `argb`.

### labelColorFocused
With this setter you can set the color of all the value label and arrows when focused. Expected input is an `argb`.

### padding
With this setter you can set the padding on the left side of the Adjuster component. Expected input is a `number`

### focusAnimation
With this setter you can set a animation for when the adjuster is focused. Expected input is a `Lightning.Animation`

## Getters

### label
The getter returns the current value of the label.

### options
The getter returns the current options.

### value
This getter returns the current value index of the current option selected.

### focusColor
This getter returns an `argb` of the focusColor property.

### labelColor
This getter returns an `argb` of the labelColor property.

### labelColorFocused
This getter returns an `argb` of the labelColorFocused property.

### paddings
This getter returns a `number` of the padding on the left side of the adjuster.