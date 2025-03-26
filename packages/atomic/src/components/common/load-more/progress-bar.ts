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
      class="from-more-results-progress-bar-color-from to-color-more-results-progress-bar-color-to absolute top-0 left-0 z-1 h-full overflow-hidden rounded bg-linear-to-r"
      style="width: ${Math.ceil((from / to) * 100)}%"
    ></div>
  </div>`;
