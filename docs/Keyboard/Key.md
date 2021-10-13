# Key

The Key component is a button like component that you can use for the Keyboard component. It is also the fallback component the Keyboard uses if a default button type has not been set.

## Usage

If you want to use the Key component, import it from Lightning UI.

```js
import { Key } from '@lightningjs/ui'
```

### Initialize

To use the Key component you crate an instance with the `type` Key. Generally you do this in the _template method, howover this component is specifically made for the Keyboard component so instead we will add the Key to the `configuration` object of the keyboard.

```js
const myKeyboardConfig = {
    layouts,
    buttonTypes: {
        default: {
            type: Key
        }
    }
}
```

### Customize

By default the Key component has a black background and white label, which colors will swap when the Key component is focused. You can change these colors by using an object containing a `focused` color and an `unfocused` color:

```js
default: {
    type: Key,
    backgroundColors: {
        unfocused: 0xff0000ff,
        focused: 0xff00ff00
    },
    labelColors: {
        unfocused: 0xffffffff,
        focused: 0xff000000
    }
}
```

When the colors object has no `focused` color it will use the `unfocused` color as a fallback. The fallback values for `unfocused` for the background is black and for the label white.

If you want to change anything related to the label of the Key you can use the `label` setter to adjust the label tag:

```js
{
default: {
    type: Key,
    label: {
        text: {
            fontSize: 44,
            fontFamily: 'MyFont-Regular',
            //basically any setter you can use when using a text texture
        }
    }
}
```

#### Extending

You can also extend the Key component if you want to further customize, or use the Key component as a backbone for your own Key component. For example if you want to make use of an icon instead of a label you can do that like this:

```js
class IconKey extends Key {
    set icon(src) {
        this._icon = src;
        //call for _update
        this._update();
    }

    get icon() {
        return this._icon;
    }

    _update() {
        if(!this.active) {
            //blocking update if not active.
            return;
        }
        const hasFocus = this.hasFocus();
        let {focused, unfocused = 0xff000000} = this.backgroundColors;
        //Use labelColors and label to color the icon.
        let {focused: labelFocused, unfocused: labelUnfocused = 0xffffffff} = this.labelColors;
        
        this.patch({
            Background: {color: hasFocus && focused ? focused : unfocused},
            Label: {src: this.icon, color: hasFocus && labelFocused ? labelFocused : labelUnfocused}
        });
    }
}

const myKeyboardConfig = {
    layouts,
    buttonTypes: {
        default: {
            type: Key
        },
        Backspace: {
            type: IconKey, icon: 'images/backspace.png'
        }
    }
}
```

So for the IconKey component you could add a getter and setter for `icon` and copy the code that is used in the `_update` method code. We are using the Label tag to render an Image texture, this way you don't have to add code the Key component already does for you when it is getting focused.

## Setters

# data
Sets the data `object` the Key component uses in order for it to display the correct label.

# label
Patches an object to the label `tag`, this allows you to customize the label tag.

# labelColors
Sets the colors `object` the Key component uses to switch the color when it is focused.

# background
Patches an object to the background `tag`, this allows you to customize the background tag.

# backgroundColors
Sets the backgroundColors `object` the Key component uses to switch the color when it is focused.

## Getters

# data
Returns the data `object` the Key component uses in order for it to display the correct label.

# label
Returns the label `tag`, this allows you to customize the label `tag`.

# labelColors
Returns the colors `object` the Key component uses to switch the color when it is focused.

# background
Returns the background `tag`, this allows you to customize the background `tag`.

# backgroundColors
Returns the backgroundColors `object` the Key component uses to switch the color when it is focused.
