# Input Field

The Input Field component allows you to quickly display a label and cursor(optional) on screen that keeps itself up to date with the Keyboard component when both are linked together.

## Usage

If you want to use the InputField component, import it from Lightning UI.

```js
import { InputField } from '@lightningjs/ui'
```

### Initialize

To use the Input Field component you create an instance with the `type` InputField:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MyInputField: {type: InputField},
            MyKeyboard: {type: Keyboard}
        }
    }

    _init() {
        const inputField = this.tag('InputField')
        this.tag('MyKeyboard').inputField(inputField)
    }
}
```

The Input Field component without a Keyboard component is a little bit useless so in this example we also added the Keyboard to the template. Beside adding it to the template you also need to connect the two components, you can do that by calling the `inputField` method of the Keyboard component. Generally you would do this in the _setup or _init method of your page. However you could have multiple Input Fields on one page so you can use it in any method.

### Customize

By default the Input Field looks very standard, for this reason we added some setters in order for you to easily customize your Input Field component. If you want to change anything related to the input text you can use the `inputText` setter:

```js
{
    MyInputField: {
        type: InputField,
        inputText: {
            fontSize: 44,
            fontFamily: 'MyFont-Regular',
            //basically any setter you can use when using a text texture
        }
    }
}
```

When you want to show a description of the Input Field when its empty you can use the `description` setter.

```js
{
    MyInputField: {
        type: InputField,
        description: 'Search...'
    }
}
```

You can also customize the cursor by using the `cursor` setter.

```js
{
    MyInputField: {
        type: InputField,
        cursor: {
            h: 40,
            w: 10,
            //anything you generally do when making Lightning tags
        }
    }
}
```

## Methods

### toggleCursor
Toggles the visibility of the curser. Expected input is a `boolean`. If no input is given it flips the current visibility status.

## Setters 

### passwordMode
Sets if the input should be masked or not. Expected input is a `boolean`.

### autoHideCursor
Sets if the cursor should be hidden if there is no input. Expected input is a `boolean`.

## Getters

### input
Returns the current input as a `string`.

### hasInput
Returns `true` if the current input is more than 1. Returns `false` when the current input is 0 (zero).

### cursorIndex
Returns the cursor `index`.

### cursor
Returns the cursor `tag`.

### cursorVisible
Returns if the cursor is visible or not. Returns a `boolean`.

### autoHideCursor
Returns if the cursor should be automatically hidden.

### inputText
Return the input label configuration as an `object`. This returns only the altered values used by the developer.