// The Lit equivalent of this file is grid-layout.ts
import {type FunctionalComponent, h} from '@stencil/core';

export interface DisplayGridProps {
  selectorForItem: string;
  item: {clickUri: string; title: string};
  setRef: (element?: HTMLElement) => void;
  select: () => void;
  beginDelayedSelect: () => void;
  cancelPendingSelect: () => void;
}

export const DisplayGrid: FunctionalComponent<DisplayGridProps> = (
  {setRef, selectorForItem},
  children
) => {
  let ref: HTMLElement | undefined;
  return (
    // biome-ignore lint/a11y: to reconsider after migration
    <div
      part="result-list-grid-clickable-container outline"
      ref={(element) => {
        ref = element;
        setRef(element);
      }}
      onClick={(event) => {
        event.preventDefault();
        (ref?.querySelector(selectorForItem) as HTMLElement)?.click();
      }}
    >
      {...children}
    </div>
  );
};
