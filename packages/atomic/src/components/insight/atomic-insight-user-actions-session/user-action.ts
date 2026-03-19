import type {UserAction as IUserAction} from '@coveo/headless/insight';
import {html, nothing} from 'lit';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import BookmarkIcon from '@/src/images/bookmark.svg';
import DocumentIcon from '@/src/images/document.svg';
import PointIcon from '@/src/images/point.svg';
import QuickviewIcon from '@/src/images/quickview.svg';
import SearchIcon from '@/src/images/search.svg';
import {parseTimestampToDateDetails} from '@/src/utils/date-utils';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

const icons = {
  SEARCH: SearchIcon,
  CLICK: DocumentIcon,
  VIEW: QuickviewIcon,
  CUSTOM: PointIcon,
  TICKET_CREATION: BookmarkIcon,
};

interface UserActionProps {
  action: IUserAction;
  bindings: InsightBindings;
}

export const renderUserAction: FunctionalComponent<UserActionProps> = ({
  props,
}) => {
  const renderActionTimestamp = () => {
    const {hours, minutes} = parseTimestampToDateDetails(
      props.action.timestamp
    );

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  };

  const renderIcon = () => {
    const iconClasses = tw({
      'w-3 h-3': true,
      'text-primary': ['CLICK', 'VIEW'].includes(props.action.actionType),
    });

    return html`<atomic-icon
      icon=${icons[props.action.actionType]}
      class=${multiClassMap(iconClasses)}
    ></atomic-icon>`;
  };

  const renderActionTitle = () => {
    switch (props.action.actionType) {
      case 'TICKET_CREATION':
        return html`<div class="ticket-creation-action__text text-xs font-semibold">
          ${props.bindings.i18n.t('ticket-created')}
        </div>`;
      case 'CUSTOM':
        return html`<div class="text-xs font-semibold">
          ${props.action.eventData?.value ?? props.action.eventData?.type}
        </div>`;
      case 'SEARCH':
        return html`<div class="text-xs font-semibold">
          ${props.action.query || props.bindings.i18n.t('empty-search')}
        </div>`;
      case 'VIEW':
        return html`<a
          href=${props.action.document?.contentIdValue}
          class="text-primary text-xs font-semibold"
          target="_blank"
        >
          ${props.action.document?.title}
        </a>`;
      case 'CLICK':
        return html`<div class="text-xs font-semibold">
          ${props.action.document?.title}
        </div>`;
      default:
        return nothing;
    }
  };

  return html`<li class="flex">
    <div class="flex-none pr-2">
      <div class="flex justify-center py-1">${renderIcon()}</div>
      <div class="flex justify-center py-1">
        <div class="user-action__separator h-7 w-0.5 rounded"></div>
      </div>
    </div>
    <div class="flex-1">
      ${renderActionTitle()}
      <div class="text-neutral-dark text-xxs flex py-2 font-light">
        <div>${renderActionTimestamp()}</div>
        <div class="px-2">${props.action.searchHub}</div>
      </div>
    </div>
  </li>`;
};
