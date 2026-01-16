import {
  type ResultTemplate as RecsResultTemplate,
  type ResultTemplateCondition as RecsResultTemplateCondition,
  ResultTemplatesHelpers,
} from '@coveo/headless/recommendation';
import {LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {RecsResultTemplateController} from '@/src/components/common/result-templates/recs-result-template-controller';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {mapProperty} from '@/src/utils/props-utils';
import '@/src/components/common/atomic-component-error/atomic-component-error';
import {arrayConverter} from '@/src/converters/array-converter';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';

/**
 * A [result template](https://docs.coveo.com/en/atomic/latest/usage/displaying-results#defining-a-result-template) determines the format of the query results, depending on the conditions that are defined for each template.
 *
 * A `template` element must be the child of an `atomic-recs-result-template`, and an `atomic-recs-list` must be the parent of each `atomic-recs-result-template`.
 *
 * **Note:** Any `<script>` tags that are defined inside a `<template>` element will not be executed when the results are being rendered.
 *
 * @slot default - The default slot where to insert the template element.
 * @slot link - A `template` element that contains a single `atomic-result-link` component.
 */
@customElement('atomic-recs-result-template')
@withTailwindStyles
export class AtomicRecsResultTemplate
  extends LitElement
  implements LitElementWithError
{
  private recsResultTemplateController: RecsResultTemplateController;

  @state() error!: Error;

  /**
   * A function that must return true on results for the result template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to results whose `title` contains `singapore`:
   * `document.querySelector('#target-template').conditions = [(result) => /singapore/i.test(result.title)];`
   */
  @property({attribute: false, type: Array, converter: arrayConverter})
  conditions: RecsResultTemplateCondition[] = [];

  /**
   * The field and values that define which result items the condition must be applied to.
   * For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`:
   * `must-match-filetype="lithiummessage,YouTubePlaylist"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * The field and values that define which result items the condition must not be applied to.
   * For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`:
   * `must-not-match-filetype="lithiummessage"`
   * @type {Record<string, string[]>}
   * @default {}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;

  constructor() {
    super();
    const validParents = ['atomic-recs-list', 'atomic-ipx-recs-list'];
    const allowEmpty = true;
    this.recsResultTemplateController = new RecsResultTemplateController(
      this,
      validParents,
      allowEmpty
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.recsResultTemplateController.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch,
      ResultTemplatesHelpers
    );
  }

  @errorGuard()
  render() {
    return nothing;
  }

  /**
   * Gets the appropriate result template based on the conditions applied.
   */
  public async getTemplate(): Promise<RecsResultTemplate<DocumentFragment> | null> {
    return (
      this.recsResultTemplateController?.getTemplate(this.conditions) || null
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-recs-result-template': AtomicRecsResultTemplate;
  }
}
