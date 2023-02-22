import './augmentation-helper';
import type { StepperEvent } from '../Stepper';

declare module './augmentation-helper' {
    namespace Lightning {
        namespace Component {
            interface FireAncestorsMap {
                $onValueChanged(event: StepperEvent): void
            }
        }
    }
}