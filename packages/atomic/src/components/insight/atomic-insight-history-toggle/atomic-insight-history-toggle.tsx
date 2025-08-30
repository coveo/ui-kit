import {Component, h, Prop} from '@stencil/core';
import Clockicon from '../../../images/clock.svg';
import {IconButton} from '../../common/stencil-iconButton';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-history-toggle',
  styleUrl: 'atomic-insight-history-toggle.pcss',
  shadow: true,
})
export class AtomicInsightHistoryToggle {
  @Prop({mutable: true}) public clickCallback: () => void = () => {};

  @Prop({mutable: true}) public tooltip = '';

  public render() {
    return (
      <IconButton
        partPrefix="insight-history-toggle"
        style="outline-neutral"
        icon={Clockicon}
        ariaLabel="history"
        onClick={this.clickCallback}
        title={this.tooltip}
      />
    );
  }
}
