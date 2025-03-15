import {html} from 'lit';

interface LoadMoreProgressBarProps {
  from: number;
  to: number;
}

export const loadMoreProgressBar = ({from, to}: LoadMoreProgressBarProps) =>
  html`<div
    part="progress-bar"
    class="bg-neutral relative my-2 h-1 w-72 rounded"
  >
    <div
      class="z-1 bg-linear-to-r from-more-results-progress-bar-color-from to-color-more-results-progress-bar-color-to absolute left-0 top-0 h-full overflow-hidden rounded"
      style="width: ${Math.ceil((from / to) * 100)}%"
    ></div>
  </div>`;
