import {Component, h, Prop} from '@stencil/core';
import EditIcon from '../../../images/edit.svg';
import {IconButton} from '../../common/stencil-iconButton';

/**
 * @internal
 */
@Component({
  tag: 'atomic-insight-edit-toggle',
  styleUrl: 'atomic-insight-edit-toggle.pcss',
  shadow: true,
})
export class AtomicInsightEditToggle {
  @Prop({mutable: true}) public clickCallback: () => void = () => {};

  @Prop({mutable: true}) public tooltip = '';

  public render() {
    return (
      <IconButton
        partPrefix="insight-edit-toggle"
        style="outline-neutral"
        icon={EditIcon}
        ariaLabel="Edit"
        onClick={this.clickCallback}
        title={this.tooltip}
      />
    );
  }
}
