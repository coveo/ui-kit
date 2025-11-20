import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderHeading} from '../../heading';

export interface SmartSnippetQuestionProps {
  headingLevel?: number;
  question: string;
}

export const renderSmartSnippetQuestion: FunctionalComponent<
  SmartSnippetQuestionProps
> = ({props}) => {
  return renderHeading({
    props: {
      level: props.headingLevel ? props.headingLevel + 1 : 0,
      class: 'text-xl font-bold',
      part: 'question',
    },
  })(html`${props.question}`);
};
