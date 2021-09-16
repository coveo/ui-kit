// @ts-ignore
import defaultTemplate from './quanticResult.html';
import { LightningElement, api } from "lwc";

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").ResultTemplatesManager} ResultTemplatesManager */

/**
 * The `QuanticResult` component is used internally by the `QuanticResultList` component.
 * @category LWC
 */
export default class QuanticResult extends LightningElement {
  /**
   * The ID of the engine instance with which to register.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The result item.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The template manager from which to get registered custom templates.
   * @api
   * @type {ResultTemplatesManager}
   */
  @api resultTemplatesManager;

  get icon() {
    if (this.objectTypeIcon) {
      return this.objectTypeIcon;
    }
    if (this.fileTypeIcon) {
      return this.fileTypeIcon;
    }

    return 'doctype:unknown';
  }

  get objectTypeIcon() {
    const objType = this.result.raw.objecttype;
    if (!objType) {
      return undefined;
    }
    switch (objType.toLowerCase()) {
      case 'faq':
        return 'standard:question_feed';
      case 'message':
        return 'standard:note';
      case 'city':
        return 'standard:household';
      default:
        return `standard:${objType.toLowerCase()}`;
    }
  }

  get fileTypeIcon() {
    const fileType = this.result.raw.filetype;
    if (!fileType) {
      return undefined;
    }

    const lower = fileType.toLowerCase();
    if (lower.indexOf('youtube') !== -1) {
      return 'doctype:video';
    }
    if (lower.indexOf('doc')) {
      return 'doctype:gdoc';
    }
    if (lower.indexOf('xls')) {
      return 'doctype:excel';
    }
    return `dcotype:${lower}`;
  }

  render() {
    const template = this.resultTemplatesManager.selectTemplate(this.result);
    if (template) {
      return template;
    }

    return defaultTemplate;
  }
}
