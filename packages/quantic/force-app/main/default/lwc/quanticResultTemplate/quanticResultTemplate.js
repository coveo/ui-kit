import {LightningElement} from 'lwc';

/**
 * The `QuanticResultTemplate` component is used to construct result templates using predefined and formatted [slots](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.create_components_slots).
 * See [Use the Result Template Component](https://docs.coveo.com/en/quantic/latest/usage/result-template-usage/).
 * @category Result Template
 * @example
 * <c-quantic-result-template>
 *   <div slot="label"></div>
 *   <div slot="badges"></div>
 *   <div slot="actions"></div>
 *   <div slot="date"></div>
 *   <div slot="visual"></div>
 *   <div slot="title"></div>
 *   <div slot="metadata"></div>
 *   <div slot="emphasized"></div>
 *   <div slot="excerpt"></div>
 *   <div slot="bottom-metadata"></div>
 * </c-quantic-result-template>
 */
export default class QuanticResultTemplate extends LightningElement {}