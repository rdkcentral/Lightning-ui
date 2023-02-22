import Lightning from '@lightningjs/core';

// Augmentation only works with non-default named exports, since
// Lightning only has a default export, we use this simple helper
// file to export Lightning as a named export and then augment it
// in augmentations.d.ts
// https://github.com/microsoft/TypeScript/issues/14080#issuecomment-1050833256
export { Lightning };