import {html} from 'lit';
import {type ButtonProps, renderButton} from '@/src/components/common/button';
import {
  type HeadingProps,
  renderHeading,
} from '@/src/components/common/heading';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import {getQuestionPart} from './get-question-part';

export interface QuestionProps {
  /**
   * The aria-controls attribute value.
   */
  ariaControls: string;
  /**
   * Whether the question is expanded.
   */
  expanded: boolean;
  /**
   * The heading level.
   */
  headingLevel?: number;
  /**
   * The click event handler.
   */
  onClick: (event: MouseEvent) => void;
  /**
   * The question text.
   */
  question: string;
}

export const renderQuestion: FunctionalComponentWithChildren<QuestionProps> =
  ({props}) =>
  (children) => {
    const buttonProps: ButtonProps = {
      style: 'text-neutral',
      part: getQuestionPart('button', props.expanded),
      onClick: props.onClick,
      class: 'flex items-center px-4',
      ariaExpanded: props.expanded ? 'true' : 'false',
      ariaControls: props.ariaControls,
    };

    const headingProps: HeadingProps = {
      level: props.headingLevel ? props.headingLevel + 1 : 0,
      class: 'py-4 text-left text-xl font-bold',
      part: getQuestionPart('text', props.expanded),
    };

    return renderButton({props: buttonProps})(
      html`${children}${renderHeading({props: headingProps})(
        html`${props.question}`
      )}`
    );
  };
