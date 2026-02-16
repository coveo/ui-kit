import {h, FunctionalComponent} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';
import {HeadingProps} from './heading';

/**
 * @deprecated should only be used for Stencil components.
 */
export const Heading: FunctionalComponent<
  Pick<HeadingProps, 'level'> & JSXBase.HTMLAttributes<HTMLHeadingElement>
> = ({level, ...htmlProps}, children) => {
  const HeadingTag = level > 0 && level <= 6 ? `h${level}` : 'div';
  return <HeadingTag {...htmlProps}>{children}</HeadingTag>;
};
