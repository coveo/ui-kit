import {html} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface LoadMoreProgressBarProps {
  from: number;
  to: number;
}
/**
 * @cssprop --atomic-more-results-progress-bar-color-from - Color of the start of the gradient for the load more results progress bar.
 * @cssprop --atomic-more-results-progress-bar-color-to - Color of the end of the gradient for the load more results progress bar.
 */
export const renderLoadMoreProgressBar: FunctionalComponent<
  LoadMoreProgressBarProps
> = ({props}) => {
  const {from, to} = props;
  const percentage = to > 0 ? Math.min((from / to) * 100, 100) : 0;
  const width = `${Math.ceil(percentage)}%`;

  return html`
    <div part="progress-bar" class="bg-neutral relative my-2 h-1 w-72 rounded">
      <div
        class="progress-bar from-more-results-progress-bar-color-from to-more-results-progress-bar-color-to absolute top-0 left-0 z-1 h-full overflow-hidden rounded bg-linear-to-r"
        style=${styleMap({width})}
      ></div>
    </div>
  `;
};
