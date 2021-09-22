// @ts-ignore
import defaultTemplate from './quanticResult.html';
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

    return `standard:document`;
  }

  get objectTypeIcon() {
    const objType = this.result.raw.objecttype;
    if (!objType) {
      return undefined;
    }
    switch (objType.toLowerCase()) {
      case 'feeditem':
        return 'standard:feed';
      case 'how_to':
        return 'standard:question_feed';
      case 'message':
        return 'standard:note';
      case 'city':
        return 'standard:household';
      case 'kb_knowledge':
        return 'standard:knowledge';
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
    switch (lower) {
      case 'youtubevideo':
        return 'custom:custom99';
      case 'kb_knowledge':
        return 'standard:knowledge';
      case 'html':
        return 'standard:document';
      case 'doc':
        return 'doctype:gdoc';
      case 'xls':
        return 'doctype:excel';
      default:
        return `doctype:${lower}`;
    }
  }

  get label() {
    if (this.objectTypeLabel) {
      return this.objectTypeLabel;
    }
    if (this.fileTypeLabel) {
      return this.fileTypeLabel;
    }
    if (this.sourceTypeLabel) {
      return this.sourceTypeLabel;
    }
    
    
    return `Documentation`
  }

  get objectTypeLabel() {
    const objType = this.result.raw.objecttype;
    if (!objType) {
      return undefined;
    }

    const lower = objType.toLowerCase();
    switch (lower) {
      case 'feeditem':
        return `Chatter`;
      case 'message':
        return `Message`;
      default:
        return undefined;
    }
  }

  get sourceTypeLabel() {
    const sourceType = this.result.raw.sourcetype;
    if (!sourceType) {
      return undefined;
    }

    const lower = sourceType.toLowerCase();
    switch (lower) {
      case 'youtube':
        return `Video`;
      case 'web':
      case 'sitemap':
      case 'salesforce':
      case 'confluence2':
        return `Documentation`;
      case 'sharepoint':
        return `PDF`;
      default:
        return sourceType;
    }
  }

  get fileTypeLabel() {
    const fileType = this.result.raw.filetype;
    if (!fileType) {
      return undefined;
    }

    const lower = fileType.toLowerCase();
    switch (lower) {
      case 'pdf':
        return `PDF`;
      case 'ppt':
        return `PPT`;
      case 'kb_knowledge':
        return `Knowledge`;
      default:
        return fileType;
    }
  }

  get videoSourceId() {
    return `https://www.youtube.com/embed/${this.result.raw.ytvideoid}?autoplay=0`

  }

  render() {
    const template = this.resultTemplatesManager.selectTemplate(this.result);
    if (template) {
      return template;
    }

    return defaultTemplate;
  }
}