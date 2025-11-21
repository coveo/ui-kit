import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../../stencil-button';
import {Heading} from '../../stencil-heading';

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetSuggestionsWrapper: FunctionalComponent<{
  headingLevel: number;
  i18n: i18n;
}> = ({headingLevel, i18n}, children) => {
  return (
    <aside
      part="container"
      class="bg-background border-neutral text-on-background overflow-hidden rounded-lg border"
      aria-label={i18n.t('smart-snippet-people-also-ask')}
    >
      <Heading
        level={headingLevel}
        part="heading"
        class="border-neutral border-b px-6 py-4 text-xl leading-8"
      >
        {i18n.t('smart-snippet-people-also-ask')}
      </Heading>
      <ul part="questions" class="divide-neutral divide-y">
        {children}
      </ul>
    </aside>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetSuggestionsQuestionWrapper: FunctionalComponent<{
  expanded: boolean;
  key: string;
}> = ({expanded, key}, children) => {
  return (
    <li
      key={key}
      part={`question-answer-${expanded ? 'expanded' : 'collapsed'}`}
      class="flex flex-col"
    >
      <article class="contents">{children}</article>
    </li>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetSuggestionsQuestion: FunctionalComponent<{
  ariaControls: string;
  expanded: boolean;
  headingLevel?: number;
  onClick: (event: MouseEvent) => void;
  question: string;
}> = (
  {ariaControls, expanded, headingLevel, onClick, question},
  atomicIcon
) => {
  return (
    <Button
      style="text-neutral"
      part={getQuestionPart('button', expanded)}
      onClick={onClick}
      class="flex items-center px-4"
      ariaExpanded={expanded ? 'true' : undefined}
      ariaControls={expanded ? ariaControls : undefined}
    >
      {atomicIcon}
      <Heading
        level={headingLevel ? headingLevel + 1 : 0}
        class="py-4 text-left text-xl font-bold"
        part={getQuestionPart('text', expanded)}
      >
        {question}
      </Heading>
    </Button>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetSuggestionsAnswerAndSourceWrapper: FunctionalComponent<{
  expanded: boolean;
  id: string;
}> = ({id}, children) => {
  return (
    <div part="answer-and-source" class="pr-6 pb-6 pl-10" id={id}>
      {children}
    </div>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetSuggestionsFooter: FunctionalComponent<{
  i18n: i18n;
}> = ({i18n}, children) => {
  return (
    <footer part="footer" aria-label={i18n.t('smart-snippet-source')}>
      {children}
    </footer>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const getQuestionPart = (base: string, expanded: boolean) =>
  `question-${base}-${expanded ? 'expanded' : 'collapsed'}`;
