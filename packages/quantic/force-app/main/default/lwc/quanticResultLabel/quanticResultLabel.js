import {LightningElement, api} from "lwc";

import documentation from '@salesforce/label/c.quantic_Documentation';
import message from '@salesforce/label/c.quantic_Message';
import video from '@salesforce/label/c.quantic_Video';

import {objectTypeIcons} from './icons/objectTypeIcons';
import {fileTypeIcons} from './icons/fileTypeIcons';

const KNOWLEDGE='Knowledge';
const CHATTER='Chatter';

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultLabel` component displays an [SLDS icon](https://www.lightningdesignsystem.com/icons/) and label for a result.
 * If the `Result` option is set this component can infer default label and icon based on the result properties. Otherwise the `label` and `icon` properties are required.
 * @category Result Template
 * @example
 * <c-quantic-result-label label="Account" icon="standard:account" size="medium" icon-only></c-quantic-result-label>
 */
export default class QuanticResultLabel extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/search/controllers/result-list/#result) to use to infer label and icon.
   * @api
   * @type {Result}
   */
  @api result;
  /**
   * The label to display.
   * @api
   * @type {string}
   */
  @api label;
  /**
   * The name of the [SLDS icon](https://www.lightningdesignsystem.com/icons/) to display.
   * @api
   * @type {string}
   */
  @api icon;
  /**
   * Size of the icon and label to display.
   * @api
   * @type {'xx-small' | 'x-small' | 'small' | 'medium' | 'large'}
   * @defaultValue `'small'`
   */
  @api size  ='small';
  /**
   * Whether to only display the icon without the label.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api iconOnly = false;

  labels = {
    documentation,
    message,
    video,
    chatter: CHATTER,
    knowledge: KNOWLEDGE,
  }

  error;

  connectedCallback() {
    if (!this.result && (!this.label || !this.icon)) {
      console.error(`The ${this.template.host.localName} requires either specified value for label and icon or a result object to display correctly.`);
      this.error = `${this.template.host.localName} Error`;
    }
  }

  renderedCallback() { 
    this.setLabelSize();
  }

  setLabelSize() {
    // @ts-ignore
    this.template.querySelector('.result-label__label')?.style.setProperty('font-size', this.size);
  }

  get iconToDisplay() {
    if (this.icon) {
      return this.icon;
    }
    if (this.isKnowledgeArticle) {
      return 'standard:knowledge';
    }
    if (this.objectTypeIcon) {
      return this.objectTypeIcon;
    }
    if (this.fileTypeIcon) {
      return this.fileTypeIcon;
    }
    return 'standard:document';
  }

  get labelToDisplay() {
    if (this.label) {
      return this.label;
    }
    if (this.isKnowledgeArticle) {
      return KNOWLEDGE;
    }
    if (this.objectTypeLabel) {
      return this.objectTypeLabel;
    }
    if (this.fileTypeLabel) {
      return this.fileTypeLabel;
    }
    if (this.sourceTypeLabel) {
      return this.sourceTypeLabel;
    }
    return this.labels.documentation;
  }

  get isKnowledgeArticle() {
    return !!this.result.raw.sfknowledgearticleid;
  }

  get objectTypeIcon() {
    const objType = this.result.raw.objecttype?.toLowerCase();
    return objectTypeIcons[objType];
  }

  get fileTypeIcon() {
    const fileType = this.result.raw.filetype?.toLowerCase();
    return fileTypeIcons[fileType];
  }

  get objectTypeLabel() {
    const objType = this.result.raw.objecttype;
    if (!objType) {
      return undefined;
    }

    const lower = objType.toLowerCase();
    switch (lower) {
      case 'feeditem':
        return this.labels.chatter;
      case 'message':
        return this.labels.message;
      case 'knowledge':
        return this.labels.knowledge;
      default:
        return objType;
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
      case 'ppt':
      case 'xls':
      case 'doc':
        return lower.toUpperCase();
      case 'kb_knowledge':
        return this.labels.knowledge;
      case 'youtubevideo':
        return this.labels.video;
      default:
        return fileType;
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
        return 'YouTube';
      case 'confluence2':
        return this.labels.documentation;
      default:
        return sourceType;
    }
  }
}