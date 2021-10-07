import {LightningElement, api} from "lwc";

/** @typedef {import("coveo").Result} Result */

/**
 * The `QuanticResultLabel` component displays an icon and label for a result.
 * If the `Result` option is set this component can infer default label and icon based on the result properties.
 * Otherwise the `label` and `icon` properties are required.
 * @example
 * <c-quantic-result-label label="My Result" icon="thisicon" size="medium"></c-quantic-result-label>
 */
export default class QuanticResultLabel extends LightningElement {
  /**
   * The [result item](https://docs.coveo.com/en/headless/latest/reference/controllers/result-list/#result) to use to infer label and icon.
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
   * The icon to display.
   * @api
   * @type {string}
   */
  @api icon;
  /**
   * Size of the icon and label to display.
   * @api
   * @type {string}
   * @defaultValue `'small'`
   */
  @api size  ='small';

  error;

  connectedCallback() {
    if (!this.result && (!this.label || !this.icon)) {
      console.error(`The QuanticResultLabel requires either specified value for label and icon or a result object to display correctly.`);
      this.error = 'QuanticResultLabel Error';
    }
  }

  renderedCallback() { 
    this.setLabelSize();
  }

  setLabelSize() {
    this.template.querySelector('.result-label__label')?.style.setProperty('font-size', this.size);
  }

  get iconToDisplay() {
    if (this.icon) {
      return this.icon;
    }
    if (this.objectTypeIcon) {
      return this.objectTypeIcon;
    }
    if (this.fileTypeIcon) {
      return this.fileTypeIcon;
    }
    return `standard:document`;
  }

  get labelToDisplay() {
    if (this.label) {
      return this.label;
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
    return `Documentation`;
  }

  get objectTypeIcon() {
    const objType = this.result.raw.objecttype?.toLowerCase();
    if (!objType) {
      return undefined;
    }

    const defaultIcon = `standard:${objType}`;
    const iconMap = {
      'feeditem': 'standard:post',
      'how_to': 'standard:question_feed',
      'message': 'standard:note',
      'city': 'standard:address',
      'continent': 'standard:location',
      'kb_knowledge': 'standard:knowledge',
      'item': 'standard:feed',
      'blogpost': 'standard:news',
      'attachment': 'doctype:attachment',
      'board': 'standard:dashboard_ea',
      'casecomment': 'standard:case_comment',
      'collaborationgroup': 'standard:team_member',
      'contentversion': 'standard:drafts',
      'food': 'custom:custom51',
      'goal': 'standard:goals',
      'invoice': 'standard:partner_fund_claim',
      'doc': 'doctype:word',
    };

    const icon = iconMap[objType];
    return icon ?? defaultIcon;
  }

  get fileTypeIcon() {
    const fileType = this.result.raw.filetype?.toLowerCase();
    if (!fileType) {
      return undefined;
    }

    const defaultIcon = `doctype:${fileType}`;
    const iconMap = {
      'youtubevideo': 'custom:custom99',
      'youtubeplaylist': 'custom:custom99',
      'kb_knowledge': 'standard:knowledge',
      'doc': 'doctype:word',
      'xls': 'doctype:excel',
    }

    const icon = iconMap[fileType];
    return icon ?? defaultIcon;
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
        return 'PDF';
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
      case 'ppt':
      case 'xls':
      case 'doc':
        return lower.toUpperCase();
      case 'kb_knowledge':
        return `Knowledge`;
      default:
        return fileType;
    }
  }
}