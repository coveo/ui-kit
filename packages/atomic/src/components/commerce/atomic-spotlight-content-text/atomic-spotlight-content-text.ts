import {type SpotlightContent, SpotlightContentTemplatesHelpers} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {createSpotlightContentContextController} from '@/src/components/commerce/spotlight-content-template-component-utils/context/spotlight-content-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

/**
 * The `atomic-spotlight-content-text` component renders the value of a string field of a Spotlight Content item, such
 * as its `name` or `description`. When the Spotlight Content defines a font color for the field (for example,
 * `nameFontColor` for `name`), the text uses that color.
 *
 * @part text - The element containing the text.
 */
@customElement('atomic-spotlight-content-text')
@bindings()
@withTailwindStyles
export class AtomicSpotlightContentText
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = css`
    :host([hidden]) {
      display: none;
    }
  `;

  /**
   * The Spotlight Content field whose value the component should render, for example `name` or `description`.
   */
  @property({type: String, reflect: true}) public field!: string;

  /**
   * The locale key of the text to display when the field has no value for the Spotlight Content.
   */
  @property({type: String, reflect: true}) public default?: string;

  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;
  @state() private spotlightContent?: SpotlightContent;

  private spotlightContentController = createSpotlightContentContextController(this);

  public initialize() {
    if (!this.spotlightContent && this.spotlightContentController.item) {
      this.spotlightContent = this.spotlightContentController.item;
    }
  }

  public willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);
    this.hidden = !!this.spotlightContent && !this.text;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    const text = this.text;
    if (!text) {
      return nothing;
    }

    return html`<span part="text" style=${styleMap({color: this.fontColor})}>${text}</span>`;
  }

  private get text() {
    if (!this.spotlightContent || !this.field) {
      return undefined;
    }
    return this.getFieldValue(this.field) ?? this.defaultText;
  }

  private get defaultText() {
    return this.default ? this.bindings?.i18n.t(this.default) : undefined;
  }

  private get fontColor() {
    return this.getFieldValue(`${this.field}FontColor`);
  }

  private getFieldValue(field: string) {
    const value = SpotlightContentTemplatesHelpers.getSpotlightContentProperty(
      this.spotlightContent!,
      field
    );
    return typeof value === 'string' && value !== '' ? value : undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-spotlight-content-text': AtomicSpotlightContentText;
  }
}
