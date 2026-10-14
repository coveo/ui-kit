import {html} from 'lit';
import {until} from 'lit/directives/until.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import NoConnection from '../../../images/no-connection.svg';
import '../../common/atomic-icon/atomic-icon';
import type {KnownErrorType} from './known-error-types';

interface QueryErrorIconProps {
  errorType?: string;
}

/**
 * Returns the illustration of an error type. The `Disconnected` illustration is bundled because the
 * network may be down when it shows. The others are fetched when an error renders; if that fails,
 * the error shows without an illustration.
 */
export const loadQueryErrorIcon = (
  errorType?: string,
  loadIcons: () => Promise<typeof import('./icons')> = () => import('./icons')
): string | Promise<string> =>
  (errorType as KnownErrorType) === 'Disconnected'
    ? NoConnection
    : loadIcons()
        .then(({getQueryErrorIcon}) => getQueryErrorIcon(errorType))
        .catch(() => '');

export const renderQueryErrorIcon: FunctionalComponent<QueryErrorIconProps> = ({props}) => {
  return html`<atomic-icon
    part="icon"
    icon=${until(loadQueryErrorIcon(props.errorType), '')}
    class="w-1/2 max-w-lg"
  ></atomic-icon>`;
};
