import {FunctionalComponent, h} from '@stencil/core';

interface LoadMoreProgressBarProps {
  from: number;
  to: number;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const LoadMoreProgressBar: FunctionalComponent<
  LoadMoreProgressBarProps
> = ({from, to}) => {
  const percentage = (from / to) * 100;
  const width = `${Math.ceil(percentage)}%`;
  return (
    <div part="progress-bar" class="bg-neutral relative my-2 h-1 w-72 rounded">
      <div
        class="progress-bar absolute top-0 left-0 z-1 h-full overflow-hidden rounded bg-linear-to-r"
        style={{width}}
      ></div>
    </div>
  );
};
