// @ts-ignore
import defaultTemplate from './quanticResult.html';
import { LightningElement, api } from "lwc";
import {TimeSpan} from 'c/quanticUtils';

/** @typedef {import("coveo").Result} Result */
/** @typedef {import("coveo").ResultTemplatesManager} ResultTemplatesManager */

/**
 * The `QuanticResult` component is used internally by the `QuanticResultList` component.
 * @example
 * <c-quantic-result engine-id={engineId} result={result} result-templates-manager={resultTemplatesManager}></c-quantic-result>
 */
export default class QuanticResult extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
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
    return `standard:document`;
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
      'kb_knowledge': 'standard:knowledge',
      'doc': 'doctype:word',
      'xls': 'doctype:excel',
    }

    const icon = iconMap[fileType];
    return icon ?? defaultIcon;
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
    return `Documentation`;
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

  get videoThumbnail() {
    return `http://img.youtube.com/vi/${this.result.raw.ytvideoid}/mqdefault.jpg`
  }

  get videoSourceId() {
    return `https://www.youtube.com/embed/${this.result.raw.ytvideoid}?autoplay=0`;
  }

  get videoTimeSpan() {
    return new TimeSpan(this.result.raw.ytvideoduration, false).getCleanHHMMSS();
  }

  render() {
    const template = this.resultTemplatesManager.selectTemplate(this.result);
    if (template) {
      return template;
    }
    return defaultTemplate;
  }
}