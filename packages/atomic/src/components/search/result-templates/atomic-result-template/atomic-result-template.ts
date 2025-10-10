import type {ResultTemplate, ResultTemplateCondition} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ResultTemplateController} from '@/src/components/common/result-templates/result-template-controller';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {mapProperty} from '@/src/utils/props-utils';
import '@/src/components/common/atomic-component-error/atomic-component-error';

/**
 * A [result template](https://docs.coveo.com/en/atomic/latest/usage/displaying-results#defining-a-result-template) determines the format of the query results, depending on the conditions that are defined for each template.
 *
 * @slot default - Mandatory. A `template` element that defines the structure of the result item.
 * @slot link - A `template` element that contains a single `atomic-result-link` component.
 *
 * **Note:** Any `<script>` tags that are defined inside a `<template>` element will not be executed when the results are being rendered.
 */
@customElement('atomic-result-template')
@withTailwindStyles
export class AtomicResultTemplate extends LitElement {
  private resultTemplateController!: ResultTemplateController;

  @state() public error?: Error;

  /**
   * A function that must return true on results for the result template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to results whose `title` contains `singapore`:
   * `document.querySelector('#target-template').conditions = [(result) => /singapore/i.test(result.title)];`
   */
  public conditions: ResultTemplateCondition[] = [];

  /**
   * Verifies whether the specified fields match the specified values.
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true}) public mustMatch: Record<string, string[]> =
    {};

  /**
   * Verifies whether the specified fields do not match the specified values.
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true}) public mustNotMatch: Record<
    string,
    string[]
  > = {};

  connectedCallback() {
    super.connectedCallback();
    this.resultTemplateController = new ResultTemplateController(
      this,
      [
        'atomic-result-list',
        'atomic-folded-result-list',
        'atomic-search-box-instant-results',
      ],
      true
    );
  }

  willUpdate() {
    if (this.resultTemplateController) {
      this.resultTemplateController.matchConditions = makeMatchConditions(
        this.mustMatch,
        this.mustNotMatch,
        ResultTemplatesHelpers
      );
    }
  }

  render() {
    if (this.error) {
      return html`<atomic-component-error
        .element=${this}
        .error=${this.error}
      ></atomic-component-error>`;
    }
    return nothing;
  }

  /**
   * Gets the appropriate result template based on conditions applied.
   */
  public async getTemplate(): Promise<ResultTemplate<DocumentFragment> | null> {
    return this.resultTemplateController?.getTemplate(this.conditions) || null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-template': AtomicResultTemplate;
  }
}
