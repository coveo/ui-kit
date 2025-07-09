import {html} from 'lit';
import {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import MinusIcon from '../../../images/minus.svg';
import PlusIcon from '../../../images/plus.svg';
import {renderButton} from '../button';
import '../atomic-icon/atomic-icon';

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
    },
  }) =>
  (children) => {
    const expandableTextClass = `expandable-text ${!isExpanded ? getLineClampClass(truncateAfter) : ''} min-lines-${truncateAfter}`;

    let buttonClass =
      'expandable-text-button p-1 text-xs leading-[calc(1/.75)]';
    if (!isTruncated && !isExpanded) {
      buttonClass += ' invisible';
    } else if (!isCollapsible && !isTruncated && isExpanded) {
      buttonClass += ' hidden';
    }

    const buttonLabel = isExpanded ? showLessLabel : showMoreLabel;
    const icon = isExpanded ? MinusIcon : PlusIcon;

    return html`<div class="flex flex-col items-start">
        <div part="expandable-text"
        class="${expandableTextClass}">
        ${children}
        </div>

        ${renderButton({
          props: {
            style: 'text-primary',
            class: buttonClass,
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
