import {Component, h, Prop, State} from '@stencil/core';
import {InitializeBindings} from '../../../utils/initialization-utils';
import {AnyBindings} from '../interface/bindings';
import {Button} from '../button';

/**
 *
 * @part button - The insight edit toggle button.
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

  public render() {
    return (
      <Button
        style="outline-neutral"
        ariaLabel={this.bindings.i18n.t(this.labelI18nKey)}
        class="p-3"
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
    );
  }
}
