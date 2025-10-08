import {isNullOrUndefined} from '@coveo/bueno';
import {type Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, Prop, State} from '@stencil/core';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';
import {
  type InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {MapProp} from '../../../../utils/props-utils';
import type {Bindings} from '../../atomic-search-interface/atomic-search-interface';

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
 *
 * @MapProp name: field;attr: field;docs: The field from which to extract the target string and the variable used to map it to the target i18n parameter. For example, the following configuration extracts the value of `author` from a result, and assign it to the i18n parameter `name`: `field-author="name"`;type: Record<string, string> ;default: {}
 */
@Component({
  tag: 'atomic-result-localized-text',
})
export class AtomicResultLocalizedText implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  @ResultContext() private result!: Result;
  /**
   * The i18n translation key.
   */
  @Prop() localeKey!: string;
  /**
   * The field value to dynamically evaluate.
   */
  @Prop() @MapProp() field: Record<string, string> = {};
  /**
   * The numerical field value used to determine whether to use the singular or plural value of a translation.
   * */
  @Prop() fieldCount?: string;

  render() {
    return this.bindings.i18n.t(this.localeKey, {
      ...this.parseFieldValues(),
      ...this.parseFieldCount(),
    });
  }

  private parseFieldValues() {
    const ret: Record<string, unknown> = {};
    if (Object.keys(this.field).length === 0) {
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
          this.fieldCount!
        ) as number) ?? 1,
    };
  }
}
