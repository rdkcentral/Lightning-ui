import './augmentation-helper';
import type { StepperEvent } from '../Stepper';
import type { ItemType } from '../helpers/CollectionWrapper';
import type ItemWrapper from '../helpers/ItemWrapper';

declare module './augmentation-helper' {
    namespace Lightning {
        namespace Component {
            interface FireAncestorsMap {
                $onValueChanged(event: StepperEvent): void;
                $getChildComponent(event: {index: number}): Lightning.Component;
                $childInactive(event: {child: ItemWrapper}): void;
            }
        }
    }
}