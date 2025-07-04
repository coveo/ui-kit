import {h, type FunctionalComponent} from '@stencil/core';
import type {JSXBase} from '@stencil/core/internal';
import type {HeadingProps} from './heading';

/**
 * @deprecated Should only be used for Stencil components; for Lit components, use the heading function instead.
 */
export const Heading: FunctionalComponent<
  Pick<HeadingProps, 'level'> & JSXBase.HTMLAttributes<HTMLHeadingElement>
> = ({level, ...htmlProps}, children) => {
  const HeadingTag = level > 0 && level <= 6 ? `h${level}` : 'div';
  return <HeadingTag {...htmlProps}>{children}</HeadingTag>;
};
