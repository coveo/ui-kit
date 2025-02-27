import {FunctionalComponent, h} from '@stencil/core';

interface LoadMoreProgressBarProps {
  from: number;
  to: number;
}

export const LoadMoreProgressBar: FunctionalComponent<
  LoadMoreProgressBarProps
> = ({from, to}) => {
  const percentage = (from / to) * 100;
  const width = `${Math.ceil(percentage)}%`;
  return (
    <div part="progress-bar" class="bg-neutral relative my-2 h-1 w-72 rounded">
      <div
        class="progress-bar z-1 bg-linear-to-r absolute left-0 top-0 h-full overflow-hidden rounded"
        style={{width}}
      ></div>
    </div>
  );
};
