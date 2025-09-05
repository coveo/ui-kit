import {Component, h, Prop, State} from '@stencil/core';
import ArrowFull from '../../../images/arrow-full.svg';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {IconButton} from '../../common/stencil-iconButton';
import {Bindings} from '../../search/atomic-search-interface/atomic-search-interface';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-full-search-button',
  styleUrl: 'atomic-insight-full-search-button.pcss',
  shadow: true,
})
export class AtomicInsightFullSearchButton implements InitializableComponent {
  @Prop({mutable: true}) public tooltip = '';

  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  public render() {
    return (
      <IconButton
        partPrefix="full-search"
        style="outline-neutral"
        icon={ArrowFull}
        ariaLabel={this.bindings.i18n.t('full-search')}
        title={this.tooltip}
      />
    );
  }
}
