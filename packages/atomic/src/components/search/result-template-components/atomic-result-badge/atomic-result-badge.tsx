import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, Element, Prop, h} from '@stencil/core';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';

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
@Component({
  tag: 'atomic-result-badge',
  styleUrl: 'atomic-result-badge.pcss',
  shadow: true,
})
export class AtomicResultBadge {
  @ResultContext() private result!: Result;
  @Element() host!: HTMLElement;
  /**
   * The field to display in the badge.
   *
   * Not compatible with `label`, slotted elements nor multi-value fields.
   */
  @Prop({reflect: true}) public field?: string;

  /**
   * The text to display in the badge.
   *
   * Not compatible with `field` nor slotted elements.
   */
  @Prop({reflect: true}) public label?: string;

  /**
   * Specifies an icon to display at the left-end of the badge.
   * This can be used in conjunction with `field`, `label` or slotted elements.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly
   */
  @Prop({reflect: true}) public icon?: string;

  private renderIcon() {
    return (
      <atomic-icon
        part="result-badge-icon"
        icon={this.icon!}
        class="h-3 w-3 fill-current"
      ></atomic-icon>
    );
  }

  private getTextContent() {
    if (this.field !== undefined) {
      return <atomic-result-text field={this.field}></atomic-result-text>;
    }
    if (this.label !== undefined) {
      return <atomic-text value={this.label}></atomic-text>;
    }
    return <slot></slot>;
  }

  private renderText() {
    return <span part="result-badge-label">{this.getTextContent()}</span>;
  }

  private renderBadge() {
    return (
      <div
        part="result-badge-element"
        class="bg-neutral-light text-neutral-dark inline-flex h-full place-items-center space-x-1.5 rounded-full px-3"
      >
        {this.icon && this.renderIcon()}
        {this.renderText()}
      </div>
    );
  }

  componentWillRender() {
    if (this.field) {
      const hasValue =
        ResultTemplatesHelpers.getResultProperty(this.result, this.field) !==
        null;
      if (!hasValue) {
        this.host.remove();
      }
    }
  }

  render() {
    return this.renderBadge();
  }
}
