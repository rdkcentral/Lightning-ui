import { vi } from 'vitest'

declare global {
  var jest: typeof vi;
}

// 'jest-webgl-canvas-mock' expects a `jest` global variable
// and `vi` is compatible with jest's API.
global.jest = vi

import 'jest-webgl-canvas-mock';
