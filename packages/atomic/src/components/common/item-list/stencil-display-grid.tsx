// The Lit equivalent of this file is grid-layout.ts
import {FunctionalComponent, h} from '@stencil/core';

interface DisplayGridProps {
  selectorForItem: string;
  item: {clickUri: string; title: string};
  setRef: (element?: HTMLElement) => void;
  select: () => void;
  beginDelayedSelect: () => void;
  cancelPendingSelect: () => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const DisplayGrid: FunctionalComponent<DisplayGridProps> = (
  {setRef, selectorForItem},
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
        (ref?.querySelector(selectorForItem) as HTMLElement)?.click();
      }}
    >
      {...children}
    </div>
  );
};
