# ProgressStepper

The ProgressStepper component is an extension of the Stepper component, this component has a progress bar and a value label. This component only works with a scope of numbers.

## Usage

If you want to use the ProgressStepper component, import it from Lightning UI.

```js
import { ProgressStepper } from '@lightningjs/ui'
```

### Initialize

To use the ProgressStepper component you create an instance with the `type` ProgressStepper:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyProgressStepper: {
                type: ProgressStepper
            },
        }
    }
}
```

This code will display the Stepper with a label on the left and a value on the right in a row. With the value being displayed with the number 50.

## Customize

You can view the [Stepper](../index.md) component page to see more information about customizing.

### Patching Template

You can always add / customize existing tags, to make this job a bit easier follow this template when altering the component:

```js
this.tag('MyProgressStepper').patch({
    Focus: {},
    Label: {},
    ValueWrapper: {
        ProgressBar: {}
        Value: {}
    }
});
```

## Setters

### label
With this setter you can change the value of the Label tag. Expected input is an `string` or `number`.

### value
With this setter you can change the value of the Value tag. Expected input is a `number` or `index`.

### max
With this setter you can set the maximum value of the number scope. Expected input is a `number`.

### min
With this setter you can set the minimum value of the number scope. Expected input is a `number`.

### focusColor
With this setter you can set the focus color of the background. Expected input is an `argb`.

### labelColor
With this setter you can set the color of all the labels. Expected input is an `argb`.

### labelColorFocused
With this setter you can set the color of the value label when focused. Expected input is an `argb`.

### padding
With this setter you can set the padding on the left and right side of the Stepper component. Expected input is a `number`

### focusAnimation
With this setter you can set a animation for when the Stepper component is focused. Expected input is a `Lightning.Animation`

## Getters

### label
The getter returns the current value of the label.

### value
This getter returns the current value of the value label.

### max
This getter returns the current maximum value of the number scope.

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