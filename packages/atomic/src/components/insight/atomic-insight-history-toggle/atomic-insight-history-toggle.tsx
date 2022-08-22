import {Component, h, Prop} from '@stencil/core';
import Clockicon from '../../../images/clock.svg';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-history-toggle',
  shadow: true,
})
export class AtomicInsightHistoryToggle {
  @Prop({mutable: true}) public clickCallback: () => void = () => {};

  @Prop({mutable: true}) public tooltip = '';

  public render() {
    return (
      <atomic-icon-button
        icon={Clockicon}
        labelI18nKey="insight-history"
        click-callback={this.clickCallback}
        tooltip={this.tooltip}
      />
    );
  }
}
