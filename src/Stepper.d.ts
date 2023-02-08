import Component from '@lightningjs/core/src/application/Component.mjs';
import Element from '@lightningjs/core/src/tree/Element.mjs';

declare namespace Stepper {
    export interface TemplateSpec<ContentType extends Element = Element> extends Component.TemplateSpec {
        /**
         * Sets the color for the focus indication
         * Returns argb numeral
         */
        focusColor: any,
        /**
         * Sets the color for the labels
         * Returns argb numeral
         */
        labelColor: any,
        /**
         * Sets the color for the labels when Component is focused
         * Returns argb numeral
         */
        labelColorFocused: any,
        /**
         * Sets the padding on the left and right of the Component
         */
        padding: number,
        /**
         * Sets the maximum value when using a number Stepper
         */
        max: number,
        /**
         * Sets the minimum value when using a number Stepper
         */
        min: number,
        /**
         * Sets the current value when using of the Stepper
         */
        value: number,
        /**
         * Sets the label value which represents the label of the stepper.
         */
        label: string,
        /**
         * Sets the label value which represents the label of the stepper.
         */
        focusAnimation: Animation,
        /**
         * Sets the options for a more custom stepper.
        */
        options: any
    }
}

declare class Stepper<ContentType extends Element = Element>
    extends Component<Stepper.TemplateSpec<ContentType>> {
        /**
         * Sets the color for the focus indication
         * Returns argb numeral
         */
        focusColor: any;
        /**
         * Sets the color for the labels
         * Returns argb numeral
         */
        labelColor: any;
        /**
         * Sets the color for the labels when Component is focused
         * Returns argb numeral
         */
        labelColorFocused: any;
        /**
         * Sets the padding on the left and right of the Component
         */
        padding: number;
        /**
         * Sets the maximum value when using a number Stepper
         */
        max: number;
        /**
         * Sets the minimum value when using a number Stepper
         */
        min: number;
        /**
         * Sets the current value when using of the Stepper
         */
        value: number;
        /**
         * Sets the label value which represents the label of the stepper.
         */
        label: string;
        /**
         * Sets the label value which represents the label of the stepper.
         */
        focusAnimation: Animation;
        /**
         * Sets the options for a more custom stepper.
        */
        options: any;
    }