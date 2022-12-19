import { Component } from '@lightningjs/core';
import TestRenderer
  from '@lightningjs/ui-components/test/lightning-test-renderer';

import Grid from './Grid';

const GridComponent = {
    Grid: {
        type: Grid,
        autoResize: true,
        columns: 10,
        spacing: 15,
    }
}

const render = () => {
    const testRenderer = TestRenderer.create(GridComponent)
    const instance = testRenderer.getInstance();

    instance.items = new Array(50).fill({
        type: Item
    })

    return {
        testRenderer,
        instance
    }
}

class Item extends Component {
    static get width() {
        return 60
    }
    static get height() {
        return 60
    }
}

describe('Grid', () => {
    it('Correctly clears the items', () => {
        const { instance } = render();
        instance.clear();
        expect(instance.items.length).toBe(0)
    })

    it('Correctly keeps the index within the limits of the Grid', () => {
        const { instance } = render()
        instance.setIndex(50)
        expect(instance.index).toBe(49)
        expect(instance._mainIndex).toBe(4) // The last row (vertical)
        expect(instance._crossIndex).toBe(9)    // The last column (horizontal)
    })

    it('Correctly keeps track of indexes when using keypresses and setIndex calls sequentially', () => {
        const { testRenderer, instance } = render()
        expect(instance.items.length).toBe(50);
        expect(instance.index).toBe(0)
        testRenderer.keyPress('Down')
        expect(instance.index).toBe(10)
        testRenderer.keyPress('Up')
        expect(instance.index).toBe(0)
        instance.setIndex(1)
        expect(instance.index).toBe(1)
        testRenderer.keyPress('Down')
        expect(instance.index).toBe(11)
    })
})