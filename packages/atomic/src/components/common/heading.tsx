import {h, FunctionalComponent} from '@stencil/core';
import {JSXBase} from '@stencil/core/internal';

export interface HeadingProps {
  /**
   * The heading level.
   *
   * A value outside of the range of 1 to 6 will render a span instead of a heading.
   */
  level: number;
}

export const Heading: FunctionalComponent<
  HeadingProps & JSXBase.HTMLAttributes<HTMLHeadingElement>
> = ({level, ...htmlProps}, children) => {
  const HeadingTag = level > 0 && level <= 6 ? `h${level}` : 'span';
  return (
    <HeadingTag class="atomic-hidden" {...htmlProps}>
      {children}
    </HeadingTag>
  );
};
