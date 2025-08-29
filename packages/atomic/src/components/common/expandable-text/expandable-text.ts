import {html} from 'lit';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import MinusIcon from '../../../images/minus.svg';
import PlusIcon from '../../../images/plus.svg';
import {renderButton} from '../button';
import '../atomic-icon/atomic-icon';
import {type Ref, ref} from 'lit/directives/ref.js';

export type TruncateAfter = 'none' | '1' | '2' | '3' | '4';

const getLineClampClass = (truncateAfter: TruncateAfter) => {
  const lineClampMap: Record<TruncateAfter, string> = {
    none: 'line-clamp-none',
    1: 'line-clamp-1',
    2: 'line-clamp-2',
    3: 'line-clamp-3',
    4: 'line-clamp-4',
  };
  return lineClampMap[truncateAfter] || 'line-clamp-2';
};

export interface ExpandableTextProps {
  isExpanded: boolean;
  isTruncated: boolean;
  isCollapsible?: boolean;
  truncateAfter: TruncateAfter;
  onToggleExpand: (e: MouseEvent | undefined) => void;
  showMoreLabel: string;
  showLessLabel: string;
  textRef: Ref<HTMLDivElement>;
}

export const renderExpandableText: FunctionalComponentWithChildren<
  ExpandableTextProps
> =
  ({
    props: {
      isExpanded,
      isTruncated,
      isCollapsible,
      truncateAfter,
      onToggleExpand,
      showMoreLabel,
      showLessLabel,
      textRef,
    },
  }) =>
  (children) => {
    const expandableTextClasses = tw({
      'expandable-text leading-[var(--line-height)]': true,
      [getLineClampClass(truncateAfter)]: !isExpanded,
      [`min-lines-${truncateAfter}`]: true,
    });

    const buttonClasses = tw({
      'expandable-text-button p-1 text-xs leading-[calc(1/.75)]': true,
      invisible: !isTruncated && !isExpanded,
      hidden: isExpanded && (!isTruncated || !isCollapsible),
    });

    const buttonClassString = Object.entries(buttonClasses)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(' ');

    const buttonLabel = isExpanded ? showLessLabel : showMoreLabel;
    const icon = isExpanded ? MinusIcon : PlusIcon;

    return html`<div class="flex flex-col items-start">
        <div part="expandable-text"
        class="${multiClassMap(expandableTextClasses)}"
        ${ref(textRef)}
        >
        ${children}
        </div>

        ${renderButton({
          props: {
            style: 'text-primary',
            class: buttonClassString,
            title: buttonLabel,
            onClick: onToggleExpand,
          },
        })(
          html`
          <atomic-icon icon="${icon}" class="mx-1 w-2 align-baseline"></atomic-icon>
          ${buttonLabel}`
        )}
    </div>`;
  };
