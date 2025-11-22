import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Heading} from '../../stencil-heading';

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetWrapper: FunctionalComponent<{
  headingLevel?: number;
  i18n: i18n;
}> = ({headingLevel, i18n}, children) => {
  return (
    <aside aria-label={i18n.t('smart-snippet')}>
      <Heading level={headingLevel ?? 0} class="sr-only">
        {i18n.t('smart-snippet')}
      </Heading>
      <article
        class="bg-background border-neutral text-on-background rounded-lg border p-6 pb-4"
        part="smart-snippet"
      >
        {children}
      </article>
    </aside>
  );
};

interface SmartSnippetQuestionProps {
  headingLevel?: number;
  question: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetQuestion: FunctionalComponent<SmartSnippetQuestionProps> = ({headingLevel, question}) => {
  return (
    <Heading
      level={headingLevel ? headingLevel + 1 : 0}
      class="text-xl font-bold"
      part="question"
    >
      {question}
    </Heading>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetTruncatedAnswer: FunctionalComponent<{
  answer: string;
  style?: string;
}> = ({answer, style}) => {
  return (
    <div part="truncated-answer">
      <atomic-smart-snippet-answer
        exportparts="answer"
        part="body"
        htmlContent={answer}
        innerStyle={style}
      ></atomic-smart-snippet-answer>
    </div>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetFooter: FunctionalComponent<{i18n: i18n}> = (
  {i18n},
  children
) => {
  return (
    <footer part="footer" aria-label={i18n.t('smart-snippet-source')}>
      {children}
    </footer>
  );
};
