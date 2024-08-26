import {FunctionalComponent, h} from '@stencil/core';
import {UserAction} from '../..';
import BookmarkIcon from '../../../../images/bookmark.svg';
import DocumentIcon from '../../../../images/document.svg';
import PointIcon from '../../../../images/point.svg';
import QuickviewIcon from '../../../../images/quickview.svg';
import SearchIcon from '../../../../images/search.svg';
import {parseTimestampToDateDetails} from '../../../../utils/date-utils';
import {InsightBindings} from '../../atomic-insight-interface/atomic-insight-interface';

const icons = {
  SEARCH: SearchIcon,
  CLICK: DocumentIcon,
  VIEW: QuickviewIcon,
  CUSTOM: PointIcon,
  TICKET_CREATION: BookmarkIcon,
};

interface AtomicInsightUserAction {
  action: UserAction;
  bindings: InsightBindings;
}

export const AtomicInsightUserAction: FunctionalComponent<
  AtomicInsightUserAction
> = ({bindings, action}) => {
  const renderActionTimestamp = () => {
    const {hours, minutes} = parseTimestampToDateDetails(action.timestamp);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  };

  const renderIcon = () => {
    const iconClasses = `w-3 h-3 ${['CLICK', 'VIEW'].includes(action.actionType) ? 'text-primary' : ''}`;

    return (
      <atomic-icon
        icon={icons[action.actionType]}
        class={iconClasses}
      ></atomic-icon>
    );
  };

  const renderActionTitle = () => {
    if (action.actionType === 'TICKET_CREATION') {
      return (
        <div class="ticket-creation-action__text text-xs font-semibold">
          {bindings.i18n.t('ticket-created')}
        </div>
      );
    } else if (action.actionType === 'CUSTOM') {
      return (
        <div class="text-xs font-semibold">
          {action.eventData?.value ?? action.eventData?.type}
        </div>
      );
    } else if (action.actionType === 'SEARCH') {
      return (
        <div class="text-xs font-semibold">
          {action.query || bindings.i18n.t('empty-search')}
        </div>
      );
    } else if (action.actionType === 'VIEW') {
      return (
        <a
          href={action.document?.contentIdValue}
          class="text-primary text-xs font-semibold"
          target="_blank"
        >
          {action.document?.title}
        </a>
      );
    } else if (action.actionType === 'CLICK') {
      return <div class="text-xs font-semibold">{action.document?.title}</div>;
    }
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
        <div class="text-neutral-dark text-xxs flex py-2 font-light">
          <div>{renderActionTimestamp()}</div>
          <div class="px-2">{action.searchHub}</div>
        </div>
      </div>
    </div>
  );
};
