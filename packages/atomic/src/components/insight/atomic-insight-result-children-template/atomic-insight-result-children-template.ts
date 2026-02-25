import type {
  ResultTemplate as InsightResultTemplate,
  ResultTemplateCondition as InsightResultTemplateCondition,
} from '@coveo/headless/insight';
import {ResultTemplatesHelpers as InsightResultTemplatesHelpers} from '@coveo/headless/insight';
import {LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ResultTemplateController} from '@/src/components/common/result-templates/result-template-controller';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {arrayConverter} from '@/src/converters/array-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {mapProperty} from '@/src/utils/props-utils';

/**
 * The `atomic-insight-result-children-template` component determines the display format of child results within an `atomic-insight-result-children` component.
 *
 * @slot default - The `<template>` element defining the layout of child results.
 */
@customElement('atomic-insight-result-children-template')
@withTailwindStyles
export class AtomicInsightResultChildrenTemplate
  extends LitElement
  implements LitElementWithError
{
  private resultTemplateController: ResultTemplateController;
  @state() error!: Error;

  /**
   * An array of functions that must each return `true` for this template to apply to a child result.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to child results whose `title` contains `singapore`:
   * `document.querySelector('#target-template').conditions = [(result) => /singapore/i.test(result.title)];`
   */
  @property({attribute: false, type: Array, converter: arrayConverter})
  conditions: InsightResultTemplateCondition[] = [];

  /**
   * The field and values that define which child results this template applies to.
   *
   * For example, a template with the following attribute only applies to child results whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * The field and values that exclude child results from this template.
   *
   * For example, a template with the following attribute only applies to child results whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;

  constructor() {
    super();
    const validParents = ['atomic-insight-result-children'];
    this.resultTemplateController = new ResultTemplateController(
      this,
      validParents
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.resultTemplateController.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch,
      InsightResultTemplatesHelpers
    );
  }

  @errorGuard()
  render() {
    return nothing;
  }

  /**
   * Returns the result template to apply to a child result, based on all defined conditions.
   */
  public async getTemplate(): Promise<InsightResultTemplate<DocumentFragment> | null> {
    const template = this.resultTemplateController?.getTemplate(
      this.conditions
    );
    return template;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result-children-template': AtomicInsightResultChildrenTemplate;
  }
}
