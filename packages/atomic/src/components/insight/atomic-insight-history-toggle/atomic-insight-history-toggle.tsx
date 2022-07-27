import {Component, h, State, Element, Prop} from '@stencil/core';
import Clockicon from '../../../images/clock.svg';
import {InsightIconButton} from '../insight-icon-button/insight-icon-button';

/**
 * @part button - The refine toggle button.
 */
@Component({
  tag: 'atomic-insight-history-toggle',
  styleUrl: '../insight-icon-button/insight-icon-button.pcss',
  shadow: true,
})
export class AtomicInsightHistoryToggle {
  @Element() public host!: HTMLElement;

  @State() public error!: Error;

  @Prop({mutable: true}) public onClick: () => void = () => {};

  @Prop({mutable: true}) public tooltip = '';

  public render() {
    return (
      <InsightIconButton
        icon={Clockicon}
        ariaLabel="User action history"
        onClick={this.onClick}
        tooltip={this.tooltip}
      />
    );
  }
}
