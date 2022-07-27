import {Component, h, State, Element, Prop} from '@stencil/core';
import EditIcon from '../../../images/edit.svg';
import {InsightIconButton} from '../insight-icon-button/insight-icon-button';

/**
 *
 * @part button - The insight edit toggle button.
 */
@Component({
  tag: 'atomic-insight-edit-toggle',
  styleUrl: '../insight-icon-button/insight-icon-button.pcss',
  shadow: true,
})
export class AtomicInsightEditToggle {
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({mutable: true}) public clickCallback: () => void = () => {};

  @Prop({mutable: true}) public tooltip = '';

  public render() {
    return (
      <InsightIconButton
        icon={EditIcon}
        ariaLabel="Edit insight"
        onClick={this.clickCallback}
        tooltip={this.tooltip}
      />
    );
  }
}
