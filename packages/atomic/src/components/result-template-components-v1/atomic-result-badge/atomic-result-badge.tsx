import {Component, Prop, h} from '@stencil/core';

/**
 * The `atomic-result-badge` element renders a badge containing a field.
 * @part result-badge-element - The badge element with the background color and text color.
 * @part result-badge-icon - The optional icon displayed in the badge element.
 * @part result-badge-label - The optional icon displayed in the badge element.
 */
@Component({
  tag: 'atomic-result-badge-v1',
  styleUrl: 'atomic-result-badge.pcss',
  shadow: true,
})
export class AtomicResultBadge {
  /**
   * The result field which the component should use.
   * This will look in the Result object first, and then in the Result.raw object for the fields.
   * It is important to include the necessary field in the ResultList component.
   */
  @Prop() public field?: string;

  /**
   * The text to display instead of the field.
   */
  @Prop() public label?: string;

  /**
   * Specifies the icon to display.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly
   */
  @Prop() public icon?: string;

  private renderIcon() {
    return (
      <atomic-icon
        part="result-badge-icon"
        icon={this.icon!}
        class="w-3 h-3 fill-current"
      ></atomic-icon>
    );
  }

  private renderText() {
    return (
      <span part="result-badge-label">
        {this.field ? (
          <atomic-result-text field={this.field}></atomic-result-text>
        ) : (
          this.label
        )}
      </span>
    );
  }

  private renderBadge() {
    return (
      <div
        part="result-badge-element"
        class="inline-flex place-items-center space-x-1.5 h-full px-3 bg-neutral-light text-neutral-dark text-xs rounded-full mr-3"
      >
        {this.icon && this.renderIcon()}
        {(this.field || this.label) && this.renderText()}
      </div>
    );
  }

  render() {
    return this.field ? (
      <atomic-field-condition
        ifDefined={this.field}
        class="flex place-items-center h-full"
      >
        {this.renderBadge()}
      </atomic-field-condition>
    ) : (
      this.renderBadge()
    );
  }
}
