// @ts-ignore
import defaultTemplate from './result.html';
import { LightningElement, api } from "lwc";

export default class QuanticResult extends LightningElement {
  /** @type {import("coveo").Result} */
  @api result;

  /** @type {import("coveo").ResultTemplatesManager} */
  @api resultTemplatesManager;

  /** @type {string} */
  @api engineId;

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
