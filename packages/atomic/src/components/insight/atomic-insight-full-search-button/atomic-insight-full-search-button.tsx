import {Component, h, Prop} from '@stencil/core';
import ArrowFull from '../../../images/arrow-full.svg';
import {IconButton} from '../../common/iconButton';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-full-search-button',
  styleUrl: 'atomic-insight-full-search-button.pcss',
  shadow: true,
})
export class AtomicInsightFullSearchButton {
  @Prop({mutable: true}) public clickCallback: () => void = () => {};

  @Prop({mutable: true}) public tooltip = '';

  public render() {
    return (
      <IconButton
        partPrefix="full-search"
        style="outline-neutral"
        icon={ArrowFull}
        ariaLabel="full-search"
        onClick={this.clickCallback}
        title={this.tooltip}
      />
    );
  }
}
