# Scrolling Label

The Scrolling Label component allows you to (automatically) scroll a long text within a set width.

## Usage

If you want to use the Scrolling Label component, import it from Lightning UI.

```js
import { ScrollingLabel } from '@lightningjs/ui'
```

### Initialize

To use the Input Field component you create an instance with the `type` InputField:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyScrollingLabel: {
                type: ScrollingLabel, 
                label: 'This bit of text is waaaaaaaaaaaaaaaaaay toooooo long...',
                w: 400
            },
        }
    }
}
```

This code sample should display a piece of text on the screen that automatically starts scrolling.

### Customize

If you want you're Scrolling Label component to not automatically start scrolling use the following:

```js
MyScrollingLabel: {
    type: ScrollingLabel, 
    label: 'This bit of text is waaaaaaaaaaaaaaaaaay toooooo long...',
    w: 400,
    autoStart: false
}
```

You can start and stop the Scrolling animation by using the `start` and `stop` function, for example when focusing or unfocusing a item.

```js
_focus() {
    this.tag('MyScrollingLabel').start();
}

_unfocus() {
    this.tag('MyScrollingLabel').stop();
}
```

## Methods

### start
Starts the scrolling animation.

### stop
Stops the scrolling animation.

## Setter

### label
Sets the text for the ScrollingLabel. Generally the input is a `string`, you can however also feed it a text `object` commonly used in Lightning to alter the styling of the label.

### align
This sets the label's alignment when the label's render width is smaller than the width of ScrollingLabel component. Expected input is either `left`, `center`, or `right`.

### repeat
This sets the amount of repeats for the scroll animation. Expected input is an `integer`. Default value for repeat is -1 which is infinite.

### delay
This sets the delay before the scroll animation starts playing. Expected input is a `float` in seconds.

### duration
This sets the duration for the animation. If there is no duration specified the component wil automatically generate a duration for the scroll animation. Expected input is a `float` in seconds.

### animationSettings
With this setter you can add more transition settings commonly used for Lightning animations. The values of repeat, delay, and duration are also stored here. Expected input is an `object`.

## Getter

### label
Return the label `tag`.

### align
Returns the current alignment.

### repeat
Returns the amount of animation repeats.

### delay
Returns the delay before the scroll animation starts.

### duration
Returns the duration of the current scroll animation.

### animationSettings
Returns the current animation settings.

