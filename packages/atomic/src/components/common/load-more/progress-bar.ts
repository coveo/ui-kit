import {html} from 'lit';
import {styleMap} from 'lit/directives/style-map.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

interface LoadMoreProgressBarProps {
  from: number;
  to: number;
}

export const renderLoadMoreProgressBar: FunctionalComponent<
  LoadMoreProgressBarProps
> = ({props}) => {
  const {from, to} = props;
  const percentage = to > 0 ? Math.min((from / to) * 100, 100) : 0;
  const width = `${Math.ceil(percentage)}%`;

  return html`
    <div part="progress-bar" class="bg-neutral relative my-2 h-1 w-72 rounded">
      <div
        class="progress-bar absolute top-0 left-0 z-1 h-full overflow-hidden rounded bg-linear-to-r"
        style=${styleMap({width})}
      ></div>
    </div>
  `;
};
