import {FunctionalComponent, h} from '@stencil/core';
import BookmarkIcon from '../../../../images/bookmark.svg';
import DocumentIcon from '../../../../images/document.svg';
import PointIcon from '../../../../images/point.svg';
import QuickviewIcon from '../../../../images/quickview.svg';
import SearchIcon from '../../../../images/search.svg';
import {parseTimestampToDateDetails} from '../../../../utils/date-utils';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';
import {UserActionType} from '../atomic-insight-user-action-session/atomic-insight-user-actions-session';

interface AtomicInsightUserAction {
  type: UserActionType;
  timestamp: number;
  actionTitle: string;
  origin: string;
  bindings: InsightBindings;
}

export const AtomicInsightUserAction: FunctionalComponent<
  AtomicInsightUserAction
> = ({type, timestamp, actionTitle, origin, bindings}) => {
  const icons = {
    SEARCH: SearchIcon,
    CLICK: DocumentIcon,
    VIEW: QuickviewIcon,
    CUSTOM: PointIcon,
    TICKET_CREATION: BookmarkIcon,
  };

  const renderActionTimestamp = () => {
    const {hours, minutes} = parseTimestampToDateDetails(timestamp);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  };

  const renderIcon = () => {
    const iconClasses = ['w-3', 'h-3'];
    if (['CLICK', 'VIEW'].includes(type)) {
      iconClasses.push('text-primary');
    }

    return (
      <atomic-icon
        icon={icons[type]}
        class={iconClasses.join(' ')}
      ></atomic-icon>
    );
  };

  const renderActionTitle = () => {
    if (type === 'TICKET_CREATION') {
      return (
        <div class="font-semibold">{bindings.i18n.t('ticket-created')}</div>
      );
    }

    const actionTitleClasses = [];
    if (['CLICK', 'VIEW'].includes(type)) {
      actionTitleClasses.push('text-primary');
    }

    return <div class={actionTitleClasses.join(' ')}>{actionTitle}</div>;
  };

  return (
    <div class="flex">
      <div class="flex-none pr-2">
        <div class="flex justify-center py-1">{renderIcon()}</div>
        <div class="flex justify-center py-1">
          <div class="user-action__separator h-7 w-0.5 rounded"></div>
        </div>
      </div>
      <div class="flex-1">
        {renderActionTitle()}
        <div class="text-neutral-dark flex text-xs">
          <div>{renderActionTimestamp()}</div>
          <div class="px-2">{origin}</div>
        </div>
      </div>
    </div>
  );
};
