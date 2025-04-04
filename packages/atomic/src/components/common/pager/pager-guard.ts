import {displayIf} from '@/src/directives/display-if';
import {FunctionalComponentGuard} from '@/src/utils/functional-component-utils';
import {html} from 'lit';

interface PagerGuardProps {
  hasError?: boolean;
  isAppLoaded: boolean;
  hasItems: boolean;
}

export const pagerGuard: FunctionalComponentGuard<PagerGuardProps> =
  ({props}) =>
  (children) => {
    const condition = !props.hasError && props.isAppLoaded && props.hasItems;
    return displayIf(condition, html`${children}`);
  };
