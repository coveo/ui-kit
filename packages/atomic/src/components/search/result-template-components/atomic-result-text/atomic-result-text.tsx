import {isArray} from '@coveo/bueno';
import {HighlightUtils, Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, Prop, h, Element, Host, State} from '@stencil/core';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {getStringValueFromResultOrNull} from '../../../../utils/result-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-decorators';

/**
 * The `atomic-result-text` component renders the value of a string result field.
 */
@Component({
  tag: 'atomic-result-text',
  shadow: false,
})
export class AtomicResultText implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;

  @Element() private host!: HTMLElement;

  @State() public error!: Error;

  /**
   * The result field which the component should use.
   * This will look in the Result object first, and then in the Result.raw object for the fields.
   * It is important to include the necessary field in the `atomic-search-interface` component.
   */
  @Prop({reflect: true}) public field!: string;
  /**
   * When this is set to `true`, the component attempts to highlight text based on the highlighting properties provided by the search API response.
   */
  @Prop({reflect: true}) public shouldHighlight = true;

  /**
   * The locale key for the text to display when the configured field has no value.
   */
  @Prop({reflect: true}) public default?: string;

  private renderWithHighlights(
    value: string,
    highlights: HighlightUtils.HighlightKeyword[]
  ) {
    try {
      const openingDelimiter = '_openingDelimiter_';
      const closingDelimiter = '_closingDelimiter_';
      const highlightedValue = HighlightUtils.highlightString({
        content: value,
        openingDelimiter,
        closingDelimiter,
        highlights,
      });
      const innerHTML = highlightedValue
        .replace(new RegExp(openingDelimiter, 'g'), '<b>')
        .replace(new RegExp(closingDelimiter, 'g'), '</b>');
      // deepcode ignore ReactSetInnerHtml: This is not React code
      return <Host innerHTML={innerHTML}></Host>;
    } catch (error) {
      this.error = error as Error;
    }
  }

  private possiblyWarnOnBadFieldType() {
    const resultValueRaw = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );
    if (isArray(resultValueRaw)) {
      this.bindings.engine.logger.error(
        `atomic-result-text cannot be used with multi value field "${this.field}" with values "${resultValueRaw}". Use atomic-result-multi-value-text instead.`,
        this
      );
    }
  }

  public render() {
    const resultValueAsString = getStringValueFromResultOrNull(
      this.result,
      this.field
    );
    if (!resultValueAsString && !this.default) {
      this.possiblyWarnOnBadFieldType();
      this.host.remove();
      return;
    }

    if (!resultValueAsString && this.default) {
      this.possiblyWarnOnBadFieldType();
      return (
        <atomic-text
          value={getFieldValueCaption(
            this.field,
            this.default,
            this.bindings.i18n
          )}
        ></atomic-text>
      );
    }

    const textValue = `${resultValueAsString}`;
    const highlightsValue = ResultTemplatesHelpers.getResultProperty(
      this.result,
      `${this.field}Highlights`
    ) as HighlightUtils.HighlightKeyword[];

    if (this.shouldHighlight && highlightsValue) {
      return this.renderWithHighlights(textValue, highlightsValue);
    }

    return getFieldValueCaption(this.field, textValue, this.bindings.i18n);
  }
}
