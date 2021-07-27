import {Component, Prop, h} from '@stencil/core';

/**
 * The `atomic-result-badge` element renders a badge containing a field.
 */
@Component({
  tag: 'atomic-result-badge',
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
  @Prop() public text?: string;

  /**
   * Specifies the icon to display from the list of available icons.
   */
  @Prop() public icon?: string;

  /**
   * Specifies a color to use for the badge.
   *
   * Defaults to `neutral-light`.
   */
  @Prop() public color?: string;

  /**
   * Specifies a text color to use for the badge.
   *
   * Defaults to `neutral-dark`.
   */
  @Prop() public textColor?: string;

  private get badge() {
    return (
      <div
        class="inline-flex place-items-center h-full px-3 bg-neutral-light text-neutral-dark text-xs rounded-full mr-3"
        style={{
          color: this.textColor ?? '',
          backgroundColor: this.color ?? '',
        }}
      >
        {this.icon && (
          <atomic-result-icon
            icon={this.icon}
            class="w-3 h-3 mr-1.5 fill-current"
          ></atomic-result-icon>
        )}
        {this.field ? (
          <atomic-result-text field={this.field}></atomic-result-text>
        ) : (
          this.text ?? ''
        )}
      </div>
    );
  }

  render() {
    return this.field ? (
      <atomic-field-condition
        ifDefined={this.field}
        class="flex place-items-center h-full"
      >
        {this.badge}
      </atomic-field-condition>
    ) : (
      this.badge
    );
  }
}
