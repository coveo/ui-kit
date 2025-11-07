import {FunctionalComponent, h} from '@stencil/core';

interface ChildrenWrapperProps {
  hasChildren: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const ChildrenWrapper: FunctionalComponent<ChildrenWrapperProps> = (
  {hasChildren},
  children
) => {
  return (
    <div part="children-root">
      {hasChildren && <slot name="before-children"></slot>}
      {children}
      {hasChildren && <slot name="after-children"></slot>}
    </div>
  );
};
