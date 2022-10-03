import {isNullOrUndefined} from '@coveo/bueno';
import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, Prop, State} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {MapProp} from '../../../../utils/props-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-decorators';

/**
 * The `atomic-result-localized-text` component renders a target i18n localized string using field values as parameter.
 *
 * Given this i18n configuration:
 * ```
 * searchInterface.i18n.addResourceBundle('en', 'translation', {
 *    foo: 'Hello world {{a_field_value}} !',
 * });
 * ```
 *
 * The component could be configured in such a way to replace `{{a_field_value}}` with a dynamic field value from the result:
 * ```
 * <atomic-result-localized-text key="foo" field-value-myfield="a_field_value"></atomic-result-localized-text>
 * ```
 *
 * @MapProp name: fieldValue;attr: field-value;docs: The field and values that define which result items to extract as an i18n parameter. For example, the following configuration extract the value of `filetype` from a result, and assign it to the i18n parameter `the_parameter`: `field-value-filetype="the_parameter"`;type: Record<string, string> ;default: {}
 */
@Component({
  tag: 'atomic-result-localized-text',
})
export class AtomicResultLocalizedText implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  @ResultContext() private result!: Result;
  /**
   * The i18n translation key
   */
  @Prop() key!: string;
  /**
   * The field value to dynamically evaluate.
   */
  @MapProp() fieldValue: Record<string, string> = {};
  /**
   * The numerical field value that should be used to determine if the singular or plural value of a translation should be used
   * */
  @Prop() fieldCount?: string;

  render() {
    const parsedFieldValue = this.parseFieldValue();
    if (this.fieldCount) {
      const count =
        (ResultTemplatesHelpers.getResultProperty(
          this.result,
          this.fieldCount!
        ) as number) ?? 1;
      return this.bindings.i18n.t(this.key, {...parsedFieldValue, count});
    }

    return this.bindings.i18n.t(this.key, parsedFieldValue);
  }

  private parseFieldValue() {
    const ret: Record<string, unknown> = {};
    if (Object.keys(this.fieldValue).length === 0) {
      return ret;
    }
    Object.entries(this.fieldValue).forEach(([fieldName, i18nParameter]) => {
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
}
