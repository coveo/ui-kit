import {Component, h, Host, Prop, State, VNode} from '@stencil/core';
import {InitializeBindings} from '../../../utils/initialization-utils';
import {AnyBindings} from '../interface/bindings';
import {Button} from '../button';

/**
 * @internal
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
  @Prop({mutable: true}) public clickCallback: () => void = () => {};
  @Prop({mutable: true}) public tooltip = '';
  @Prop({mutable: true}) public labelI18nKey!: string;
  @Prop({mutable: true}) public icon!: string;
  @Prop({mutable: true}) public buttonRef?: (el?: HTMLButtonElement) => void;
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
