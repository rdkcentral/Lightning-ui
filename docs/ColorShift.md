# ColorShift

The ColorShift component allows you to apply a color correction to the app that is currently active via the [LightningJS SDK](https://github.com/rdkcentral/Lightning-SDK) (version 5.x.x or above), or you can implement your own solution when the values are changed in the colorshift component.

The LightningJS SDK however supports color corrections for users that see colors differently than other users.

## Usage

If you want to use the ColorShift component, import it from Lightning UI.

```js
import { ColorShift } from '@lightningjs/ui'
```

### Initialize

To use the ColorShift component you create an instance with the `type` ColorShift:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyColorShift: {
                type: ColorShift,
            },
        }
    }
}
```

This code example should display a menu with four range inputs. If you are using LightningJS SDK version 4.9.0 or higher you will notice the colors changing according to the new settings.

## Customize

You can customize the ColorShift component in multiple ways, from the selection of color correction to the components used for each type of setting.

### Options

If you want to change the color correction options you can do so with the `options` setter;

```js
this.tag('MyColorShift').options = [
    {   
        type: 'neutral',
        label: 'Normal'
    },
    {
        type: 'monochromacy',
        label: 'Achromatopsia'
    }
];
```

Each option requires a `type` and a `label` property.


### Steppers

The ColorShift component can also change the components used for each range input in the component. Lightning-UI provides a few standard range input components for you to work with. For example for the correction Stepper you could use a `CarouselStepper` component that displays the options in row;

```js
import {ColorShift, CarouselStepper} from "@lightningjs/ui"
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyColorShift: {
                type: ColorShift, correctionComponent: CarouselStepper
            },
        }
    }
}
```

When you run this code you will see that the correction component changed but the other remained in the same style. These range input components are by default `ArrowStepper` components.


### Settings

You can also set saved settings for the ColorShift component, in order for it to adjust the values to current settings;

```js
this.tag('MyColorShift').options = {
    correction: `monochromacy`, //type of color correction
    brightness: 44,
    contrast: 66,
    gamma: 55
}
```

## Signals
The ColorShift component fires a signal every time a value has changed. This signal is called `onValueChanged`, to keep track of this signal you need add this signal to the tag in the template or code:

```js
//in template
{
    MyColorShift: {type: ColorShift, signals: {onValueChanged: true}}
}

onValueChanged(eventData) {
    
}
```

## Setters

### options
Sets new options for the correction tag to use. Expected input is an `array` of options, each `option` requires a `label` and a `type`.

### settings
Sets new settings for the ColorShift component to change to. Expected input is an `object`.

### autoColorShift
Sets if the component automatically tries to shift colors via the Lightning SDK colorshifter. Expected input is a `boolean`.

### stepperComponent
Sets a new component for the ColorShift component to use globally. Expected input is a `Component`, or `Stepper` type component.

### correctionComponent
Sets a new component for the ColorShift component to use for the correction tag. Expected input is a `Component`, or `Stepper` type component.

### brightnessComponent
Sets a new component for the ColorShift component to use for the brightness tag. Expected input is a `Component`, or `Stepper` type component.

### contrastComponent
Sets a new component for the ColorShift component to use for the contrast tag. Expected input is a `Component`, or `Stepper` type component.

### gammaComponent
Sets a new component for the ColorShift component to use for the gamma tag. Expected input is a `Component`, or `Stepper` type component.

## Getters

### options
Returns the current options for the correction tag as an `array`.

### settings
Returns the current settings of the ColorShift component as an `object`.

### autoColorShift
Returns the current value of the autoColorShift property.

### stepperTags
Returns the Stepper `tags` that the ColorShift component is using. This returns an `array` of all the range input components the ColorShift component is using.

### correctionTag
Returns the correction `tag` that the ColorShift component is using.

### brightnessTag
Returns the brightness `tag` that the ColorShift component is using.

### contrastTag
Returns the contrast `tag` that the ColorShift component is using.

### gammaTag
Returns the gamma `tag` that the ColorShift component is using.

### StepperComponent
Returns the Stepper component `type` that is used.

### correctionComponent
Returns the correction component `type` that is used.

### brightnessComponent
Returns the brightness component `type` that is used.

### contrastComponent
Returns the contrast component `type` that is used.

### gammaComponent
Returns the gamma component `type` that is used.


