import {isNullOrUndefined} from '@coveo/bueno';
import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {mapProperty} from '@/src/utils/props-utils';

/**
 * The `atomic-result-localized-text` component renders a target i18n localized string using the values of a target field.
 *
 * Given this i18n configuration:
 * ```
 * searchInterface.i18n.addResourceBundle('en', 'translation', {
 *    classic_book_advert: 'Classic book from {{name}}',
 * });
 * ```
 *
 * The component could be configured in such a way to replace `{{name}}` with the `author` field value from the result item:
 * ```
 * <atomic-result-localized-text locale-key="classic_book_advert" field-author="name"></atomic-result-localized-text>
 * ```
 */
@customElement('atomic-result-localized-text')
@bindings()
export class AtomicResultLocalizedText
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  /**
   * The i18n translation key.
   */
  @property({type: String, attribute: 'locale-key'})
  public localeKey!: string;

  /**
   * The field from which to extract the target string and the variable used to map it to the target i18n parameter.
   * For example, the following configuration extracts the value of `author` from a result, and assigns it to the i18n parameter `name`: `field-author="name"`.
   */
  @mapProperty({attributePrefix: 'field'})
  public field!: Record<string, string>;

  /**
   * The numerical field value used to determine whether to use the singular or plural value of a translation.
   */
  @property({type: String, attribute: 'field-count'})
  public fieldCount?: string;

  @state() private result!: Result;

  private resultController = createResultContextController(this);

  @state() public bindings!: Bindings;

  @state() public error!: Error;

  public initialize() {
    if (!this.result && this.resultController.item) {
      const item = this.resultController.item;
      if ('result' in item) {
        this.result = item.result;
      } else {
        this.result = item;
      }
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(
      this.result,
      () => {
        const localizedText = this.bindings.i18n.t(this.localeKey, {
          ...this.parseFieldValues(),
          ...this.parseFieldCount(),
        });
        return localizedText;
      },
      () => nothing
    )}`;
  }

  private parseFieldValues() {
    const ret: Record<string, unknown> = {};
    if (!this.field || Object.keys(this.field).length === 0) {
      return ret;
    }
    Object.entries(this.field).forEach(([fieldName, i18nParameter]) => {
      const fieldValueRaw = ResultTemplatesHelpers.getResultProperty(
        this.result,
        fieldName
      );
      if (!isNullOrUndefined(fieldValueRaw)) {
        ret[i18nParameter] = fieldValueRaw;
      }
    });

    return ret;
  }

  private parseFieldCount() {
    if (!this.fieldCount) {
      return {};
    }
    return {
      count:
        (ResultTemplatesHelpers.getResultProperty(
          this.result,
          this.fieldCount
        ) as number) ?? 1,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-localized-text': AtomicResultLocalizedText;
  }
}
