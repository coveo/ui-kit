import {BooleanValue, Schema, StringValue} from '@coveo/bueno';
import {
  HighlightUtils,
  type Result,
  ResultTemplatesHelpers,
} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {renderItemTextFallback} from '@/src/components/common/item-text/item-text-fallback';
import {renderItemTextHighlighted} from '@/src/components/common/item-text/item-text-highlighted';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import {getStringValueFromResultOrNull} from '@/src/utils/result-utils';
import '../atomic-text/atomic-text';

/**
 * The `atomic-result-text` component renders the value of a string field for a given result.
 */
@customElement('atomic-result-text')
@bindings()
export class AtomicResultText
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  /**
   * The result field which the component should use.
   * This will look in the Result object first, and then in the Result.raw object for the fields.
   * It is important to include the necessary field in the `atomic-search-interface` component.
   */
  @property({type: String, reflect: true}) public field!: string;

  /**
   * Whether to highlight the string field value.
   * @deprecated - replaced by `no-highlight` (this defaults to `true`, while the replacement is the inverse and defaults to `false`).
   * Only works if the `field` property is set to `title`, `excerpt`, `firstSentences`, `printableUri`, or `summary`.
   */
  @property({
    type: Boolean,
    attribute: 'should-highlight',
    reflect: true,
    converter: booleanConverter,
  })
  public shouldHighlight = true;

  /**
   * Disable highlighting of the string field value.
   * Only works if the `field` property is set to `title`, `excerpt`, `firstSentences`, `printableUri`, or `summary`.
   */
  @property({
    type: Boolean,
    reflect: true,
    useDefault: true,
    attribute: 'no-highlight',
  })
  public disableHighlight: boolean = false;

  /**
   * The locale key to use for displaying default text when the specified field has no value for the result.
   */
  @property({type: String, reflect: true}) public default?: string;

  @state() private result!: Result;

  private resultController = createResultContextController(this);

  @state() public bindings!: Bindings;

  @state() public error!: Error;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        field: this.field,
        shouldHighlight: this.shouldHighlight,
        disableHighlight: this.disableHighlight,
      }),
      new Schema({
        field: new StringValue({required: true, emptyAllowed: false}),
        shouldHighlight: new BooleanValue(),
        disableHighlight: new BooleanValue(),
      })
    );
  }

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
    return html`
      ${when(
        this.result && this.field,
        () => this.renderResultTextValue(),
        () => nothing
      )}
    `;
  }

  private get shouldRenderHighlights(): boolean {
    return (
      !this.disableHighlight &&
      this.shouldHighlight &&
      this.isFieldSupportedForHighlighting()
    );
  }

  private isFieldSupportedForHighlighting(): boolean {
    return [
      'title',
      'excerpt',
      'firstSentences',
      'printableUri',
      'summary',
    ].includes(this.field);
  }

  private highlightKeywords(): HighlightUtils.HighlightKeyword[] | null {
    if (!this.shouldRenderHighlights) {
      return null;
    }

    const highlightMap: Record<string, string> = {
      title: 'titleHighlights',
      excerpt: 'excerptHighlights',
      firstSentences: 'firstSentencesHighlights',
      printableUri: 'printableUriHighlights',
      summary: 'summaryHighlights',
    };

    const highlightPropertyName = highlightMap[this.field];
    if (!highlightPropertyName) {
      return null;
    }

    return ResultTemplatesHelpers.getResultProperty(
      this.result,
      highlightPropertyName
    ) as HighlightUtils.HighlightKeyword[];
  }

  private renderFallback() {
    if (!this.default) {
      return nothing;
    }

    return renderItemTextFallback({
      props: {
        field: this.field,
        host: this,
        logger: this.bindings.engine.logger,
        defaultValue: this.default,
        item: this.result,
        getProperty: (result: unknown, property: string) =>
          ResultTemplatesHelpers.getResultProperty(result as Result, property),
      },
    })(html`
      <atomic-text
        .value=${getFieldValueCaption(
          this.field,
          this.default!,
          this.bindings.i18n
        )}
      ></atomic-text>
    `);
  }

  private renderResultText(textValue: string) {
    const highlightKeywords = this.highlightKeywords();

    return this.shouldRenderHighlights &&
      highlightKeywords &&
      highlightKeywords.length > 0
      ? renderItemTextHighlighted({
          props: {
            textValue,
            highlightKeywords,
            highlightString: HighlightUtils.highlightString,
            onError: (error: Error) => {
              this.error = error;
            },
          },
        })
      : html`
          <atomic-text
            .value=${getFieldValueCaption(
              this.field,
              textValue,
              this.bindings.i18n
            )}
          ></atomic-text>
        `;
  }

  private renderResultTextValue() {
    const resultValueAsString = getStringValueFromResultOrNull(
      this.result,
      this.field
    );

    if (resultValueAsString === null) {
      return this.renderFallback();
    }

    return this.renderResultText(`${resultValueAsString}`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-text': AtomicResultText;
  }
}
