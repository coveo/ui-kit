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
    <div part="progress-bar" class="relative w-72 h-1 my-2 rounded bg-neutral">
      <div
        class="progress-bar absolute h-full left-0 top-0 z-1 overflow-hidden rounded bg-gradient-to-r"
        style={{width}}
      ></div>
    </div>
  );
};
