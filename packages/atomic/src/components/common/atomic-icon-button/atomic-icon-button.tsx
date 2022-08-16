import {Component, h, Host, Prop, State, VNode} from '@stencil/core';
import {InitializeBindings} from '../../../utils/initialization-utils';
import {AnyBindings} from '../interface/bindings';
import {Button} from '../button';

/**
 * The `atomic-icon-button` component displays a button and an SVG icon with a 1:1 aspect ratio.
 *
 * This component can display an icon from those available in the Atomic package, from a specific location, or as an inline SVG element.
 *
 * @part button - The button element.
 * @part badge - The span element that wraps the badge.
 */
@Component({
  tag: 'atomic-icon-button',
  styleUrl: 'atomic-icon-button.pcss',
  shadow: true,
})
export class AtomicIconButton {
  @InitializeBindings() public bindings!: AnyBindings;
  @State() public error!: Error;

  /**
   * The callback function to execute when the button is clicked.
   */
  @Prop({mutable: true}) public clickCallback: () => void = () => {};

  /**
   * The button title.
   */
  @Prop({mutable: true}) public tooltip = '';

  /**
   * The i18next key of the value to use as button label (see [Localization](https://docs.coveo.com/en/atomic/latest/usage/atomic-localization/)).
   */
  @Prop({mutable: true}) public labelI18nKey!: string;

  /**
   * The SVG icon to display.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop({mutable: true}) public icon!: string;

  /**
   *
   */
  @Prop({mutable: true}) public buttonRef?: (el?: HTMLButtonElement) => void;

  /**
   * The button badge.
   */
  @Prop({mutable: true}) public badge?: VNode;

  public render() {
    return (
      <Host>
        <Button
          style="outline-neutral"
          ariaLabel={this.bindings.i18n.t(this.labelI18nKey)}
          class="p-3 relative"
          part="button"
          onClick={this.clickCallback}
          title={this.tooltip}
          ref={this.buttonRef}
        >
          <atomic-icon
            icon={this.icon}
            class="w-4 h-4 shrink-0"
            aria-hidden="true"
          ></atomic-icon>
        </Button>
        {this.badge && <span part="badge">{this.badge}</span>}
      </Host>
    );
  }
}
