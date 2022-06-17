# Color Shift

The Color Shift component allows you to apply a color adjustment to the app that is currently active via the [LightningJS SDK](https://github.com/rdkcentral/Lightning-SDK), or you can implement your own soultion when the values are changed in the color shift component.

The LightningJS SDK however supports color corrections for users that see colors differently than other users.

## Usage

If you want to use the Color Shift component, import it from Lightning UI.

```js
import { ColorShift } from '@lightningjs/ui'
```

### Initialize

To use the Color Shift component you create an instance with the `type` ColorShift:

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

This code example should display a menu with four adjusters. If you are using the latest LightningJS SDK version you'll notice the colors changing according to the new settings.

## Customize

You can customize the Color Shift component in multiple ways, from the selection of color correction to the components used for each type of setting.

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


### Adjusters

The Color Shift component can also change the components used for each adjuster in the component. Lightning-UI provides a few standard adjuster components for you to work with. For example for the correction adjuster you could use a `CarouselAdjuster` component that displays the options in row;

```js
import {ColorShift, CarouselAdjuster} from "@lightningjs/ui"
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyColorShift: {
                type: ColorShift, correctionComponent: CarouselAdjuster
            },
        }
    }
}
```

When you run this code you will see that the correction component changed but the other remained in the same style. These adjuster components are by default `ArrowAdjuster` components.


### Settings

You can also set saved settings for the Color Shift component, in order for it to adjust the values to current settings;

```js
this.tag('MyColorShift').options = {
    correction: `monochromacy`, //type of color correction
    brightness: 44,
    contrast: 66,
    gamma: 55
}
```

## Signals
The Color Shift component fires a signal every time a value has changed. This signal is called `onValueChanged`, to keep track of this signal you need add this signal to the tag in the template or code:

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
Sets new settings for the Color Shift component to change to. Expected input is an `object`.

### adjusterComponent
Sets a new component for the Color Shift component to use globally. Expected input is a `Component`, or adjuster component.

### correctionComponent
Sets a new component for the Color Shift component to use for the correction tag. Expected input is a `Component`, or adjuster component.

### brightnessComponent
Sets a new component for the Color Shift component to use for the brightness tag. Expected input is a `Component`, or adjuster component.

### contrastComponent
Sets a new component for the Color Shift component to use for the contrast tag. Expected input is a `Component`, or adjuster component.

### gammaComponent
Sets a new component for the Color Shift component to use for the gamma tag. Expected input is a `Component`, or adjuster component.

## Getters

### options
Returns the current options for the correction tag as an `array`.

### settings
Returns the current settings of the Color Shift component as an `object`.

### adjusterTags
Returns the adjuster `tags` that the Color Shift component is using. This returns an `array` of all the adjusters the Color Shift component is using.

### correctionTag
Returns the correction `tag` that the Color Shift component is using.

### brightnessTag
Returns the brightness `tag` that the Color Shift component is using.

### contrastTag
Returns the contrast `tag` that the Color Shift component is using.

### gammaTag
Returns the gamma `tag` that the Color Shift component is using.

### adjusterComponent
Returns the adjuster component `type` that is used.

### correctionComponent
Returns the correction component `type` that is used.

### brightnessComponent
Returns the brightness component `type` that is used.

### contrastComponent
Returns the contrast component `type` that is used.

### gammaComponent
Returns the gamma component `type` that is used.


