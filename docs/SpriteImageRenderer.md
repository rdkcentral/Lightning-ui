# SpriteImageRenderer

Takes sprite image and display as a animation loader.

## Usage

If you want to use the Sprite component, import it from Lightning UI.

```js
import { SpriteImageRenderer } from '@lightningjs/ui'
```

### Initialize

To use the Sprite component you create an instance with the `type` Sprite:

```js
class MyApp extends Lightning.Application {
    static _template() {
        return {
            MySprite: {type: SpriteImageRenderer}
        }
    }
}
```


## Setter

### spriteSheet

Sets the image  for the spriteSheet.  Expected input is a `string`.

### columns

Sets number of columns for the spriteSheet.  Expected input is a `number`.


### rows
Sets number of rows for the spriteSheet.  Expected input is a `number`.

### spriteAnimationSets
You can add startFrame, endFrame, repeat (-1 equals infinite) by using `spriteAnimationSets`  :
```js
// The spriteAnimationSets will take object as parameter.
Ex:
	this.tag('MySprite').spriteAnimationSets = { start: 0, end: 58, repeat: -1 }
```

### fps
Sets fps( frames per second ) for the spriteSheet.  Expected input is a `number`.

## Methods

### start
You can start Sprite loader by using the `start` method:
```js
this.tag('MySprite').start()
```

Ex:
	this.tag('MySprite').start()

### stop
You can stop Sprite loader by using the `stop` method:
```js

Ex:
	this.tag('MySprite').stop()

```
### resume
You can resume Sprite loader by using the `resume` method:
```js

Ex:
	this.tag('MySprite').resume()

```




