# Keyboard

The Keyboard is a component that displays a... that's right a keyboard. This component positions the keys for you, and manages the input. This component also tries to reuse the keys as much as possible which makes switching layouts very quick.

## Usage

If you want to use the Keyboard component, import it from Lightning UI.

```js
import { Keyboard } from '@lightningjs/ui'
```

### Initialize

To use the Keyboard component you create an instance with the `type` Keyboard:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyKeyboard: {type: Keyboard}
        }
    }
}
```

## Configuring
To set a specific configuration for your Keyboard component you serve it an object using the `config` setter:

```js
//in the template
{
    MyKeyboard: {type: Keyboard, config: myKeyboardConfig}
}

//in methods
this.tag('MyKeyboard').config = myKeyboardConfig
```

### Adding Layouts
To actually getting something on the screen you need to set up layouts. To do this you add an `layouts` object to your keyboard configuration. This object should contain one or more arrays for example:

```js
const myKeyboardConfig = {
    layouts: {
        'ABC': [
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        ],
        '123': [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
        ]
    }
}
```

Each array represents a `layout` for your keyboard. Each layout can consist of multiple arrays that represent the rows in your keyboard. At the moment each layout has one row of keys, if you want to split up the ABC layout into multiple rows it should look something like this:

```js
const myKeyboardConfig = {
    layouts: {
        'ABC': [
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
            ['k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'],
            ['u', 'v', 'w', 'x', 'y', 'z']
        ],
        '123': [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
        ]
    }
}
```

### Keys
Each is represented by a string, this string is also used for the label of the default Key component. The Keyboard itself has a fallback Key component, but you generally want something custom. You can add your own Key component by adding a `buttonTypes` object to your keyboard configuration with the targeted Key component as default property.

```js
const myKeyboardConfig = {
    layouts,
    buttonTypes: {
        default: {
            type: MyCustomKey
        }
    }
}
```

The MyCustomKey component should have a `setter` with the name `data` in it, with this `setter` it can keep itself up to date with what it is supposed to show. The data `setter` is server with and object by the Keyboard component with the following information:

```js
{
    origin, //raw string provided in layout
    key, //single character or string
    label, //what the key component should show on screen
    action //what kind of action the key should fire on key press
}
```

### Special Keys
You can also add special keys to your layouts, these special keys are generally used for actions other than input. Special keys are recognized by the Keyboard component when it encounter a string like this:

```js
'MySpecialKey:optionalParameter'
```

When pressing a special key the Keyboard component will fire a signal based on the first part of the string like onMySpecialKey. The optionalParameter is used in case you want your special key to present that value as label, or you want to use this parameter for something else. The Keyboard component already supports the basic special keys usually used when using a keyboard like:

* Space
* Backspace
* Clear
* Layout

Additionally you can also add a specific component for a special key by adding it to the `buttonTypes` object in your configuration file.

```js
const myKeyboardConfig = {
    layouts,
    buttonTypes: {
        default: {
            type: MyCustomKey
        },
        MySpecialKey: {
            type: MyCustomKey2
        }
    }
}
```

In order to clear up some of the information above we have the following examples. Let start by adding a `Space` key.

```js
'Space'
```

This should show a `Space` key on your keyboard when its on screen. This key will fire a `onSpace` signal on in the keyboard. 

You can add a custom label to this key by using a colon:

```js
'Space:_'
```

Now the `Space` key is displayed on the screen as an underscore.

A colon indicates a special parameter, the keyboard will generally use that special parameter as a label. But in some events this special parameter is used to change for example the layout:

```js
'Layout:123'
```

In this case when the `Layout` button is pressed the Keyboard will try to switch to the 123 layout.

Sometimes there are keys that use a different styling than the default key that your are using for single character. For example you might want your `Backspace` button to have an `Icon` instead of a label. In that case you can simply add a `Backspace` property to the `buttonTypes` object in your configuration:

```js
const myKeyboardConfig = {
    layouts,
    buttonTypes: {
        default: {
            type: MyCustomKey
        },
        Backspace: {
            type: MyIconKey
        }
    }
}
```

Or if you want your `Space` key to have an alternative width than the default key you can do something like this:

```js
const myKeyboardConfig = {
    layouts,
    buttonTypes: {
        default: {
            type: MyCustomKey
        },
        Space: {
            type: MyCustomKey, w: 300
        }
    }
}
```

### Styling
You can style your Keyboard component by adding a `styling` object to your configuration object. For example; you can set the spacing between the keys or set the alignment for rows by using:

```js
const myKeyboardConfig = {
    layouts,
    buttonTypes,
    styling: {
        align: 'center', //aligns the rows when the width of the Keyboard component is bigger than 0 (zero).
        horizontalSpacing: 20, //spacing between the keys
        verticalSpacing: 20 //spacing between the rows
    }
}
```

You can also change the position of a specific row by using:

```js
const myKeyboardConfig = {
    layouts,
    buttonTypes,
    styling: {
        Row1: {
            x: 300
        }
    }
}
```

This styling would offset the x value first row in your layout to 300.

## Signals
The Keyboard component fires signals every time the input is changed, or a special key is pressed:

```js
//in template
{
    MyKeyboard: {type: Keyboard, signals: {onInputChanged: true}}
}

onInputChanged(inputData) {
    
}
```

The Keyboard supports the following signals by default:

### onInputChanged
This signal is fired when the input has changed. This signal generally comes with the following object:
```js
{
    input,
    previousInput
}
```

### onInputChanged
This signal is fired when the input has changed. This signal generally comes with the following object:
```js
{
    input,
    previousInput
}
```

### onSpace
This signal is fired when the Space key is pressed.

### onClear
This signal is fired when the Clear key is pressed.

### onBackspace
This signal is fired when the Backspace key is pressed.

### onLayout
This signal is fired when the Layout key is pressed.

## Input Field

You can connect an Input Field component to the Keyboard component by using the following code:

```js
_init() {
    //method
    this.tag('MyKeyboard').inputField(this.tag('InputField'))
    //setter
    this.tag('MyKeyboard').currentLayout = this.tag('InputField');
}
```

When there is an Input Field connected to the Keyboard component it will try to fire the function `onInputChanged` on the Input Field component if there is one.

## Available Methods

### focus
You can let the Keyboard focus a specific key by using the `focus` method:
```js
this.tag('MyKeyboard').focus(key);
```

The parameter key is a string that corresponds with the configured layout, the keyboard will look for the that specific key in the layout. If the keyboard can't find that key the focus won't change.


### resetFocus
You can reset the current focus to the keyboard to the first key of the first row by using the `resetFocus` method:
```js
this.tag('MyKeyboard').resetFocus();
```

### add
You can add values to the end of your keyboards input by using the `add` method:
```js
this.tag('MyKeyboard').add(string);
```

The parameter can be a string of any length.

### addAt
You can add value to at a specific index of your keyboards input by using the `addAt` method:
```js
this.tag('MyKeyboard').addAt(string, 3);
```

The first paramneter can be a string of any length, and the second paramenter is a number describing an index.

### remove
You can remove one character at the end of the input of your keyboard by using the `remove` method:

```js
this.tag('MyKeyboard').remove();
```

### removeAt
You can remove one character at a specific index of the input of your keyboard by using the `removeAt` method:

```js
this.tag('MyKeyboard').removeAt(2);
```

### clear
You can clear the current input of the keyboard by using the `clear` method:
```js
this.tag('MyKeyboard').clear();
```

### layout
You can change the current layout of the keyboard by using the `layout` method:
```js
this.tag('MyKeyboard').layout(string);
```

The parameter used for changing the layout is a string, corresponding with the keys used when setting up the layouts in the keyboard configuration.

### inputField
You can set and input field for the keyboard by using the `inputField` methdo: 
```js
this.tag('MyKeyboard').inputField(this.tag('InputField'))
```

## Setters

### config
Sets a new configuration for the Keyboard component. Expected input is an `object`.

### currentInputField
Sets a new input field for the Keyboard component. Expected input is a Lightning `Component`.

### currentLayout
Sets a new layout for the Keyboard component to update to. Expected input is a `string` matching the key used when configuring the layouts.

### maxCharacters
Sets the maximum input length the Keyboard registers. Expected input is a `number`.

## Getters

### config
Returns the current `config` object that is currently being used.

### currentInputField
Returns the current `InputField` component that is currently being used.

### currentLayout
Returns the current `layout` key that is being used.

### maxCharacters
Returns the maximum amount of `characters` the Keyboard component registers. Default value is 56.