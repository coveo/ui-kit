import {html} from 'lit';
import {until} from 'lit/directives/until.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import '../../common/atomic-icon/atomic-icon';

interface QueryErrorIconProps {
  errorType?: string;
}

const loadIcon = (errorType?: string) =>
  import('./icons').then(({getQueryErrorIcon}) => getQueryErrorIcon(errorType));

export const renderQueryErrorIcon: FunctionalComponent<QueryErrorIconProps> = ({props}) => {
  return html`<atomic-icon
    part="icon"
    icon=${until(loadIcon(props.errorType), '')}
    class="w-1/2 max-w-lg"
  ></atomic-icon>`;
};
