import { LightningElement, api } from 'lwc';

/**
 * The `QuanticCardContainer` component is used internally as a styling container.
 * @category LWC
 * @example
 * <c-quantic-card-container title={label}></c-quantic-card-container>
 */
export default class QuanticCardContainer extends LightningElement {
    /**
     * The title label to display in the card header.
     * @api
     * @type {string}
     */
    @api title;
}