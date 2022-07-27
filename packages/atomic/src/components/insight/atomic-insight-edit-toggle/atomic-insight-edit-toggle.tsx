import {Component, h, State, Element, Prop} from '@stencil/core';
import EditIcon from '../../../images/edit.svg';
import {Button} from '../../common/button';

/**
 *
 * @part button - The insight edit toggle button.
 */
@Component({
  tag: 'atomic-insight-edit-toggle',
  styleUrl: 'atomic-insight-edit-toggle.pcss',
  shadow: true,
})
export class AtomicInsightEditToggle {
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({mutable: true}) public onClick: () => void = () => {};

  @Prop({mutable: true}) public tooltip = '';

  public render() {
    return (
      <Button
        style="outline-neutral"
        class="p-3"
        part="button"
        onClick={this.onClick}
      >
        <atomic-icon icon={EditIcon} class="w-4 h-4 shrink-0"></atomic-icon>
        {Boolean(this.tooltip) && <div class="tooltip">{this.tooltip}</div>}
      </Button>
    );
  }
}
