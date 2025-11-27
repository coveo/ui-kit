import type {Result, ResultTemplateCondition} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {
  makeDefinedConditions,
  makeMatchConditions,
} from '@/src/components/common/template-controller/template-utils';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {mapProperty} from '@/src/utils/props-utils';

/**
 * The `atomic-field-condition` component conditionally renders content based on result properties.
 * Supports checking if fields are defined/undefined or match/don't match specific values.
 *
 * @slot default - The content to display if the conditions are met.
 */
@customElement('atomic-field-condition')
@bindings()
export class AtomicFieldCondition
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  @state() bindings!: Bindings;
  @state() error!: Error;

  private resultController = createResultContextController(this);

  /**
   * A condition that is satisfied when the specified field is defined on a result (e.g., `if-defined="author"` is satisfied when a result has the `author` field).
   */
  @property({type: String, attribute: 'if-defined'}) ifDefined?: string;

  /**
   * A condition that is satisfied when the specified field is not defined on a result (e.g., `if-not-defined="author"` is satisfied when a result does not have the `author` field).
   */
  @property({type: String, attribute: 'if-not-defined'}) ifNotDefined?: string;

  /**
   * A condition that is satisfied when the specified field matches one of the specified values on a result (e.g., `must-match-filetype="pdf,docx"` is satisfied when a result has a filetype of either pdf or docx).
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-match'})
  mustMatch!: Record<string, string[]>;

  /**
   * A condition that is satisfied when the specified field does not match any of the specified values on a result (e.g., `must-not-match-filetype="pdf"` is satisfied when a result does not have a filetype of pdf).
   * @type {Record<string, string[]>}
   */
  @mapProperty({splitValues: true, attributePrefix: 'must-not-match'})
  mustNotMatch!: Record<string, string[]>;

  initialize() {}

  private get conditions(): ResultTemplateCondition[] {
    return [
      ...makeDefinedConditions(
        this.ifDefined,
        this.ifNotDefined,
        ResultTemplatesHelpers
      ),
      ...makeMatchConditions(
        this.mustMatch,
        this.mustNotMatch,
        ResultTemplatesHelpers
      ),
    ];
  }

  private getResult(): Result | undefined {
    const item = this.resultController.item;
    if (!item) {
      return undefined;
    }
    return 'result' in item ? item.result : item;
  }

  @errorGuard()
  render() {
    const result = this.getResult();

    if (!result || !this.conditions.every((condition) => condition(result))) {
      // TODO: Replace this.hidden = true with this.remove() once all Search components are migrated from Stencil to Lit.
      // Currently using hidden to avoid breaking Stencil initialization event system in mixed Stencil/Lit component trees.
      this.hidden = true;
      return html``;
    }

    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-field-condition': AtomicFieldCondition;
  }
}
