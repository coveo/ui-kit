import type {ResultTemplate, ResultTemplateCondition} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ResultTemplateController} from '@/src/components/common/result-templates/result-template-controller';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {mapProperty} from '@/src/utils/props-utils';
import '@/src/components/common/atomic-component-error/atomic-component-error';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';

/**
 * The `atomic-result-children-template` component determines the format of the child results, depending on the conditions that are defined for each template. A `template` element must be the child of an `atomic-result-children-template`, and an `atomic-result-children` must be the parent of each `atomic-result-children-template`.
 *
 * Note: Any `<script>` tags defined inside of a `<template>` element will not be executed when results are being rendered.
 * @MapProp name: mustMatch;attr: must-match;docs: The field and values that define which result items the condition must be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is `lithiummessage` or `YouTubePlaylist`: `must-match-filetype="lithiummessage,YouTubePlaylist"`;type: Record<string, string[]> ;default: {}
 * @MapProp name: mustNotMatch;attr: must-not-match;docs: The field and values that define which result items the condition must not be applied to. For example, a template with the following attribute only applies to result items whose `filetype` is not `lithiummessage`: `must-not-match-filetype="lithiummessage";type: Record<string, string[]> ;default: {}
 */
@customElement('atomic-result-children-template')
@withTailwindStyles
export class AtomicResultChildrenTemplate
  extends LitElement
  implements LitElementWithError
{
  private resultTemplateController: ResultTemplateController;

  @state() error!: Error;

  /**
   * A function that must return true on results for the result template to apply.
   * Set programmatically before initialization, not via attribute.
   *
   * For example, the following targets a template and sets a condition to make it apply only to results whose `title` contains `singapore`:
   * `document.querySelector('#target-template').conditions = [(result) => /singapore/i.test(result.title)];`
   */
  @property({attribute: false, type: Array})
  conditions: ResultTemplateCondition[] = [];

  /**
   * Verifies whether the specified fields match the specified values.
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * Verifies whether the specified fields do not match the specified values.
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;

  constructor() {
    super();
    this.resultTemplateController = new ResultTemplateController(
      this,
      ['atomic-result-children'],
      false
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.resultTemplateController.matchConditions = makeMatchConditions(
      this.mustMatch,
      this.mustNotMatch,
      ResultTemplatesHelpers
    );
  }

  @errorGuard()
  render() {
    if (this.error) {
      return html`<atomic-component-error
        .element=${this}
        .error=${this.error}
      ></atomic-component-error>`;
    }
    return html`${nothing}`;
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
    'atomic-result-children-template': AtomicResultChildrenTemplate;
  }
}
