# Stepper

The Stepper component is a component you can use to provide a way to step through a range of option settings, for example on settings pages for volume, graphics, or accessibility.

## Usage

If you want to use the Stepper component, import it from Lightning UI.

```js
import { Stepper } from '@lightningjs/ui'
```

### Initialize

To use the Stepper component you create an instance with the `type` Stepper:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyStepper: {
                type: Stepper
            },
        }
    }
}
```

This code will display the Stepper component with a label on the left and a value on the right in a row. With the value being displayed with the number 50.

## Customize

### Options

By default the Stepper component works with values from 0 to 100. To change this you can make use of the `options` setter for example;

```js
this.tag('MyStepper').options = ['low', 'medium', 'high'];
```

You can also set an `array` of `objects`. For example, when you set a `array` of `strings` the Stepper component will translate this to an array like this;

```js
this.tag('MyStepper').options = [
    {
        label: 'low'
    }, 
    {
        label: 'medium'
    },
    {
        label: 'high'
    }
];
```

### Colors

The Stepper component has a couple of setters that can help quickly customize the component to match your app. 

```js
{
    focusColor, //the color of the background when focused
    labelColor, //the color of the label
    labelColorFocused, //the color of the value label when focused
    padding //padding of the Stepper component on the left and right
}
```

### Patching Template

You can always add / customize existing tags, to make this job a bit easier follow this template when alterning the component:

```js
this.tag('MyStepper').patch({
    Focus: {},
    Label: {},
    ValueWrapper: {
        Value: {}
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
With this setter you can set the color of all the labels when the Stepper component is focused. Expected input is an `argb`.

### padding
With this setter you can set the padding on the left and right side of the Stepper component. Expected input is a `number`

### focusAnimation
With this setter you can set a animation for when the Stepper is focused. Expected input is a `Lightning.Animation`

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

### paddings
This getter returns a `number` of the padding.