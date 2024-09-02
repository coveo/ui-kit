import {FunctionalComponent, h} from '@stencil/core';

export interface DisplayGridProps {
  item: {clickUri: string; title: string};
  setRef: (element?: HTMLElement) => void;
  select: () => void;
  beginDelayedSelect: () => void;
  cancelPendingSelect: () => void;
}

export const DisplayGrid: FunctionalComponent<DisplayGridProps> = (
  {setRef},
  children
) => {
  let ref: HTMLElement | undefined;
  return (
    <div
      part="result-list-grid-clickable-container outline"
      ref={(element) => {
        ref = element;
        setRef(element);
      }}
      onClick={(event) => {
        event.preventDefault();
        ref?.querySelector('atomic-result')?.click();
      }}
    >
      {...children}
    </div>
  );
};
