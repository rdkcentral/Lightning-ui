# ArrowStepper

The ArrowStepper component is an extension of the Stepper component, this component has an arrow on both sides of the value.

## Usage

If you want to use the ArrowStepper component, import it from Lightning UI.

```js
import { ArrowStepper } from '@lightningjs/ui'
```

### Initialize

To use the ArrowStepper component you create an instance with the `type` ArrowStepper:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyArrowStepper: {
                type: ArrowStepper
            },
        }
    }
}
```

This code will display the RangeInput with a label on the left and a value on the right in a row. With the value being displayed with the number 50.

## Customize

You can view the [Stepper](../index.md) component page to see more information about customizing.

### Patching Template
You can always add / customize existing tags, to make this job a bit easier follow this template when altering the component:

```js
this.tag('MyArrowStepper').patch({
    Focus: {},
    Label: {},
    ValueWrapper: {
        ArrowLeft: {},
        Value: {}
        ArrowRight: {}
    }
});
```

## Setters

### label
With this setter you can change the value of the Label tag. Expected input is an `string` or `number`.

### options
With this setter you can add options instead of a range of numbers. Expected input is an `array`.

### value
With this setter you can change the value of the Value tag. The value setter is also used as an index value when there are options available. Expected input is a `number` or `index`.

### max
With this setter you can set the maximum value of the number range used when no options are available. Expected input is a `number`.

### min
With this setter you can set the minimum value of the number range used when no options are available. Expected input is a `number`.

### focusColor
With this setter you can set the focus color of the background. Expected input is an `argb`.

### labelColor
With this setter you can set the color of all the labels. Expected input is an `argb`.

### labelColorFocused
With this setter you can set the color of the value label and arrows when focused. Expected input is an `argb`.

### padding
With this setter you can set the padding on the left and right side of the RangeInput component. Expected input is a `number`

### focusAnimation
With this setter you can set a animation for when the RangeInput component is focused. Expected input is a `Lightning.Animation`

## Getters

### label
The getter returns the current value of the label.

### options
The getter returns the current options.

### value
This getter returns the current value of the value label, or it returns the index of the current selected option.

### max
This getter returns the current maximum value of the number scope. When options are used this value returns the maximum index of the options array.

### min
This getter returns the current minimum value of the number scope.

### focusColor
This getter returns an `argb` of the focusColor property.

### labelColor
This getter returns an `argb` of the labelColor property.

### labelColorFocused
This getter returns an `argb` of the labelColorFocused property.

### padding
This getter returns a `number` of the padding property.