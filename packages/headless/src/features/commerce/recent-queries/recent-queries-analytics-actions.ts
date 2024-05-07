import {SearchPageEvents} from '../../analytics/search-action-cause';
import {SearchAction} from '../../search/search-actions';

export const recentQueryClick = (): SearchAction => ({
  actionCause: SearchPageEvents.recentQueryClick,
});
