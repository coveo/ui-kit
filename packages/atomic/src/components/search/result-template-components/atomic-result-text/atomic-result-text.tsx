import {HighlightUtils, Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, Prop, h, Element, State} from '@stencil/core';
import {getFieldValueCaption} from '../../../../utils/field-utils';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {getStringValueFromResultOrNull} from '../../../../utils/result-utils';
import {ItemTextFallback} from '../../../common/item-text/item-text-fallback';
import {ItemTextHighlighted} from '../../../common/item-text/item-text-highlighted';
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

  public render() {
    const resultValueAsString = getStringValueFromResultOrNull(
      this.result,
      this.field
    );

    if (resultValueAsString === null) {
      return (
        <ItemTextFallback
          field={this.field}
          host={this.host}
          logger={this.bindings.engine.logger}
          defaultValue={this.default}
          item={this.result}
          getProperty={ResultTemplatesHelpers.getResultProperty}
        >
          <atomic-text
            value={getFieldValueCaption(
              this.field,
              this.default!,
              this.bindings.i18n
            )}
          ></atomic-text>
        </ItemTextFallback>
      );
    }

    const textValue = `${resultValueAsString}`;
    const highlightKeywords = ResultTemplatesHelpers.getResultProperty(
      this.result,
      `${this.field}Highlights`
    ) as HighlightUtils.HighlightKeyword[];

    return this.shouldHighlight && highlightKeywords ? (
      <ItemTextHighlighted
        textValue={textValue}
        highlightKeywords={highlightKeywords}
        highlightString={HighlightUtils.highlightString}
        onError={(error) => (this.error = error)}
      ></ItemTextHighlighted>
    ) : (
      getFieldValueCaption(this.field, textValue, this.bindings.i18n)
    );
  }
}
