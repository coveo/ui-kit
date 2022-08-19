import {Component, h, Prop} from '@stencil/core';
import EditIcon from '../../../images/edit.svg';

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
      <atomic-icon-button
        icon={EditIcon}
        labelI18nKey="edit-insight"
        click-callback={this.clickCallback}
        tooltip={this.tooltip}
      />
    );
  }
}
