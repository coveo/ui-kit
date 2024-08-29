import {FunctionalComponent, h} from '@stencil/core';
import {LinkWithItemAnalytics} from '../item-link/item-link';
import {ItemTarget} from '../layout/display-options';

export interface DisplayGridProps {
  item: {clickUri: string; title: string};
  setRef: (element?: HTMLElement) => void;
  select: () => void;
  beginDelayedSelect: () => void;
  cancelPendingSelect: () => void;
  gridTarget?: ItemTarget;
}

export const DisplayGrid: FunctionalComponent<DisplayGridProps> = (
  {item, setRef, select, gridTarget, beginDelayedSelect, cancelPendingSelect},
  children
) => {
  return (
    <div
      part="result-list-grid-clickable-container outline"
      ref={(element) => setRef(element)}
      onClick={(event) => {
        event.preventDefault();
        select();
        window.open(
          item.clickUri,
          event.ctrlKey || event.metaKey ? '_blank' : gridTarget,
          'noopener'
        );
      }}
    >
      <LinkWithItemAnalytics
        part="result-list-grid-clickable"
        onSelect={() => select()}
        onBeginDelayedSelect={() => beginDelayedSelect()}
        onCancelPendingSelect={() => cancelPendingSelect()}
        href={item.clickUri}
        title={item.title}
        target={gridTarget}
        rel="noopener"
      >
        {item.title}
      </LinkWithItemAnalytics>
      {...children}
    </div>
  );
};
