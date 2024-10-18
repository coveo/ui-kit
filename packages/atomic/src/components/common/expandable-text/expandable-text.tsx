import {FunctionalComponent, h} from '@stencil/core';
import MinusIcon from '../../../images/minus.svg';
import PlusIcon from '../../../images/plus.svg';
import {Button} from '../button';

export type TruncateAfter = 'none' | '1' | '2' | '3' | '4';

interface ExpandableTextProps {
  isExpanded: boolean;
  isTruncated: boolean;
  isCollapsible?: boolean;
  truncateAfter: TruncateAfter;
  onToggleExpand: (e: MouseEvent | undefined) => void;
  showMoreLabel: string;
  showLessLabel: string;
}

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

const renderShowHideButton = (
  isExpanded: boolean,
  isTruncated: boolean,
  isCollapsible: boolean,
  onToggleExpand: (e?: MouseEvent) => void,
  showMoreLabel: string,
  showLessLabel: string
) => {
  if (!isTruncated && !(isCollapsible && isExpanded)) {
    return null;
  }

  if (!isCollapsible && isExpanded) {
    return null;
  }

  const label = isExpanded ? showLessLabel : showMoreLabel;

  return (
    <Button
      style="text-primary"
      class="expandable-text-button p-1 text-xs"
      title={label}
      onClick={onToggleExpand}
    >
      <atomic-icon
        icon={isExpanded ? MinusIcon : PlusIcon}
        class="mx-1 w-2 align-baseline"
      ></atomic-icon>
      {label}
    </Button>
  );
};

export const ExpandableText: FunctionalComponent<ExpandableTextProps> = (
  {
    isExpanded,
    isTruncated,
    truncateAfter,
    onToggleExpand,
    showMoreLabel,
    showLessLabel,
    isCollapsible = false,
  },
  children
) => {
  return (
    <div class="flex flex-col items-start">
      <div
        part="expandable-text"
        class={`expandable-text ${!isExpanded ? getLineClampClass(truncateAfter) : ''}`}
      >
        {children}
      </div>
      {renderShowHideButton(
        isExpanded,
        isTruncated,
        isCollapsible,
        onToggleExpand,
        showMoreLabel,
        showLessLabel
      )}
    </div>
  );
};
