import type {Result} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import '@/src/components/common/atomic-icon/atomic-icon';
import '@/src/components/search/atomic-text/atomic-text';
import '@/src/components/search/atomic-result-text/atomic-result-text';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-result-badge` element renders a badge to highlight special features of a result.
 *
 * A badge can either display:
 * * Text:
 * ```html
 * <atomic-result-badge label="trending"></atomic-result-badge>
 * ```
 * * The contents of a single-value field:
 * ```html
 * <atomic-result-badge field="objecttype"></atomic-result-badge>
 * ```
 * * An icon:
 * ```html
 * <atomic-result-badge icon="https://my-website.fake/star.svg"></atomic-result-badge>
 * ```
 * * Slotted elements:
 * ```html
 * <atomic-result-badge icon="https://my-website.fake/stopwatch.svg">
 *     Deal ends in <my-dynamic-countdown></my-dynamic-countdown>
 * </atomic-result-badge>
 * ```
 *
 * The contents of a multi-value field can be displayed as in the following example:
 * ```html
 * <atomic-result-badge icon="https://my-website.fake/language.svg">
 *    <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
 * </atomic-result-badge>
 * ```
 *
 * @part result-badge-element - The decorative outer-most element with the background color and text color.
 * @part result-badge-icon - The icon displayed at the left-end of the badge, if present.
 * @part result-badge-label - The wrapper around the contents at the right-end of the badge. This may be text, a field or slotted elements depending on which was configured.
 * @slot default - The elements to display inside the badge, instead of a field or label.
 */
@customElement('atomic-result-badge')
@withTailwindStyles
@bindings()
export class AtomicResultBadge
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state() bindings!: Bindings;
  public error!: Error;

  initialize() {}

  static styles = css`
    :host {
      display: inline-flex;
      place-items: center;
      height: var(--row-height, auto);
      word-break: break-word;
    }
  `;

  private resultContext = createResultContextController(this);

  /**
   * The field to display in the badge.
   *
   * Not compatible with `label`, slotted elements nor multi-value fields.
   */
  @property({type: String, reflect: true}) public field?: string;

  /**
   * The text to display in the badge.
   *
   * Not compatible with `field` nor slotted elements.
   */
  @property({type: String, reflect: true}) public label?: string;

  /**
   * Specifies an icon to display at the left-end of the badge.
   * This can be used in conjunction with `field`, `label` or slotted elements.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly
   */
  @property({type: String, reflect: true}) public icon?: string;

  private renderIcon() {
    return html`
      <atomic-icon
        part="result-badge-icon"
        .icon=${this.icon!}
        class="h-3 w-3 fill-current"
      ></atomic-icon>
    `;
  }

  private getTextContent() {
    if (this.field !== undefined) {
      return html`<atomic-result-text .field=${this.field}></atomic-result-text>`;
    }
    if (this.label !== undefined) {
      return html`<atomic-text .value=${this.label}></atomic-text>`;
    }
    return html`<slot></slot>`;
  }

  private renderText() {
    return html`<span part="result-badge-label">${this.getTextContent()}</span>`;
  }

  private renderBadge() {
    return html`
      <div
        part="result-badge-element"
        class="bg-neutral-light text-neutral-dark inline-flex h-full place-items-center space-x-1.5 rounded-full px-3"
      >
        ${when(this.icon, () => this.renderIcon())}
        ${this.renderText()}
      </div>
    `;
  }

  willUpdate() {
    if (this.field && this.resultContext.item) {
      const result = this.resultContext.item as Result;

      const hasValue =
        ResultTemplatesHelpers.getResultProperty(result, this.field) !== null;
      if (!hasValue) {
        this.remove();
      }
    }
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return this.renderBadge();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-badge': AtomicResultBadge;
  }
}
