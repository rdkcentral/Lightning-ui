# ProgressBar

The ProgressBar component allows you to display a progress bar in your app and customize it in a few minutes.

## Usage

If you want to use the ProgressBar component, import it from Lightning UI.

```js
import { ProgressBar } from '@lightningjs/ui'
```

### Initialize

To use the ProgressBar component you create an instance with the `type` ProgressBar:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyProgressBar: {
                type: ProgressBar, 
                h: 10,
                w: 400
            },
        }
    }
}
```
## Customizing

You can use a bunch of setters to customize your progress bar listed below. If you want more control you can also directly patch it according to the patching template.

### Patching Template

You can always add / customize existing tags, to make this job a bit easier follow this template when altering the component:

```js
this.tag('MyProgressBar').patch({
    Background: {
        Progress: {}
    }
});
```

## Setters

### value
Sets the value of the progress. Expected value is from 0 - 1. When a value higher that one is given the Progress Bar component will try to divide that number by 100 (value / 100) to normalize the value.

### progressColor
Sets the color of the progress tag. Expected input is an `argb`.

### progressColorFocused
Sets the color of the progress tag when focused, if not set this will fall back to the regular color. Expected input is an `argb`.

### backgroundColor
Sets the color of the background tag. Expected input is an `argb`.

### backgroundColorFocused
Sets the color of the background tag when focused, if not set this will fall back to the regular color. Expected input is an `argb`.

### progressRadius
Sets the radius of the progress tag. Expected input is an `argb`.

### backgroundRadius
Sets the radius of the progress tag. Expected input is an `argb`.

## Getters

### value
Returns the current value of the progress bar.

### progressColor
Returns an `argb` of the current progressColor property.

### progressColorFocused
Returns an `argb` of the current progressColorFocused property.

### backgroundColor
Returns an `argb` of the current backgroundColor property.

### backgroundColorFocused
Returns an `argb` of the current backgroundColorFocused property.

### progressRadius
Returns the current radius of the progress tag. Default is 0.

### backgroundRadius
Returns the current radius of the background tag. Default is 5.