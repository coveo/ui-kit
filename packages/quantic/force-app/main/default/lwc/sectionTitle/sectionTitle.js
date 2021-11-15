import { LightningElement, api } from 'lwc';
import sectionTitle from '@salesforce/label/c.cookbook_SectionTitle';

/**
 * The `sectionTitle` component is a title to mark the beginning of the case classification section.
 * @example
 * <c-section-title></c-section-title>
 */
export default class SectionTitle extends LightningElement {
  labels = {
    sectionTitle
  }

  /**
   * The section title
   * @type {string}
   */
  @api title = this.labels.sectionTitle;
}