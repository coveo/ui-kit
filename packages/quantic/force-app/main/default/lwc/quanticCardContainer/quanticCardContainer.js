import { LightningElement, api } from 'lwc';

/**
 * The `QuanticCardContainer` component is used internally as a styling container.
 * @category Utility
 * @example
 * <c-quantic-card-container title="Card Example"></c-quantic-card-container>
 */
export default class QuanticCardContainer extends LightningElement {
    /**
     * The title label to display in the card header.
     * @api
     * @type {string}
     */
    @api title;
}