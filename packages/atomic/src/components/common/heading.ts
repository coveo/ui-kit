import {ifDefined} from 'lit/directives/if-defined.js';
import {html, literal, unsafeStatic} from 'lit/static-html.js';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface HeadingProps {
  /**
   * The heading level.
   *
   * A value outside of the range of 1 to 6 will render a div instead of a heading.
   */
  level: number;
  /**
   * Additional classes to add to the heading.
   */
  class?: string;
  /**
   * Additional parts to add to the heading.
   */
  part?: string;
}

export const renderHeading: FunctionalComponentWithChildren<HeadingProps> =
  ({props}) =>
  (children) => {
    const {level, class: classname, part} = props;

    const headingTag =
      level > 0 && level <= 6 ? unsafeStatic(`h${level}`) : literal`div`;

    return html`<${headingTag} class="${ifDefined(classname)}" part="${ifDefined(part)}">
      ${children}
    </${headingTag}>`;
  };
