import '@lightningjs/core';

declare module '@lightningjs/core' {
    namespace Lightning {
        namespace Component {
            interface FireAncestorsMap {
                $onValueChanged(): void
            }
        }
    }
}