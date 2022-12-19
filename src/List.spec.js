import { Component } from '@lightningjs/core';
import TestRenderer
  from '@lightningjs/ui-components/test/lightning-test-renderer';

import List from './List.js';

const render = () => {
    const testRenderer = TestRenderer.create({
        List: {
            type: List
        }
    })
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

describe('List', () => {
    it('Correctly removes the items', () => {
        const { instance } = render();

        instance.remove(instance.items[3]);
        expect(instance.itemWrappers.length).toBe(49)
    })
})