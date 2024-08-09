import {Component, h, Prop, State} from '@stencil/core';
import BookmarkIcon from '../../../../images/bookmark.svg';
import DocumentIcon from '../../../../images/document.svg';
import PointIcon from '../../../../images/point.svg';
import QuickviewIcon from '../../../../images/quickview.svg';
import SearchIcon from '../../../../images/search.svg';
import {parseTimestampToDateDetails} from '../../../../utils/date-utils';
import {InitializeBindings} from '../../../../utils/initialization-utils';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';
import {UserActionType} from '../atomic-insight-user-action-session/atomic-insight-user-actions-session';

/**
 * @internal
 * The `AtomicInsightUserAction` component displays a single user action event in the user action timeline.
 * @category Insight Panel
 * @example
 * <atomic-insight-user-action type="view" actionTitle="atlas data lake" timestamp="1723035731" origin="mySearchHub"></atomic-user-action>
 */
@Component({
  tag: 'atomic-insight-user-action',
  styleUrl: 'atomic-insight-user-action.pcss',
  shadow: true,
})
export class AtomicInsightUserAction {
  @InitializeBindings() public bindings!: InsightBindings;
  @State() public error!: Error;

  @Prop({mutable: true}) public type!: UserActionType;
  @Prop({mutable: true}) public actionTitle!: string;
  @Prop({mutable: true}) public timestamp!: number;
  @Prop({mutable: true}) public origin: string = '';

  icons = {
    SEARCH: SearchIcon,
    CLICK: DocumentIcon,
    VIEW: QuickviewIcon,
    CUSTOM: PointIcon,
    TICKET_CREATION: BookmarkIcon,
  };

  renderActionTimestamp() {
    const {hours, minutes} = parseTimestampToDateDetails(this.timestamp);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  renderIcon() {
    const iconClasses = ['w-3', 'h-3'];
    if (['CLICK', 'VIEW'].includes(this.type)) {
      iconClasses.push('text-primary');
    }

    return (
      <atomic-icon
        icon={this.icons[this.type]}
        class={iconClasses.join(' ')}
      ></atomic-icon>
    );
  }

  renderActionTitle() {
    if (this.type === 'TICKET_CREATION') {
      return (
        <div class="font-semibold">
          {this.bindings.i18n.t('ticket-created')}
        </div>
      );
    }

    const actionTitleClasses = [];
    if (['CLICK', 'VIEW'].includes(this.type)) {
      actionTitleClasses.push('text-primary');
    }

    return <div class={actionTitleClasses.join(' ')}>{this.actionTitle}</div>;
  }

  public render() {
    return (
      <div class="flex">
        <div class="flex-none pr-2">
          <div class="flex justify-center py-1">{this.renderIcon()}</div>
          <div class="flex justify-center py-1">
            <div class="user-action__separator h-7 w-0.5 rounded"></div>
          </div>
        </div>
        <div class="flex-1">
          {this.renderActionTitle()}
          <div class="text-neutral-dark flex text-xs">
            <div>{this.renderActionTimestamp()}</div>
            <div class="px-2">{this.origin}</div>
          </div>
        </div>
      </div>
    );
  }
}
