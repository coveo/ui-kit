import type {SmartSnippetFeedback} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../../stencil-button';

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetFeedbackModalHeader: FunctionalComponent<{
  i18n: i18n;
}> = ({i18n}) => {
  return <h1 slot="header">{i18n.t('smart-snippet-feedback-explain-why')}</h1>;
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetFeedbackModalBody: FunctionalComponent<{
  formId: string;
  onSubmit: (e: Event) => void;
}> = ({formId, onSubmit}, children) => {
  return (
    <form
      part="form"
      id={formId}
      slot="body"
      onSubmit={onSubmit}
      class="flex flex-col gap-8"
    >
      {children}
    </form>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetFeebackModalOptions: FunctionalComponent<{
  i18n: i18n;
}> = ({i18n}, children) => {
  return (
    <fieldset>
      <legend part="reason-title" class="text-on-background text-lg font-bold">
        {i18n.t('smart-snippet-feedback-select-reason')}
      </legend>
      {children}
    </fieldset>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetFeedbackModalOption: FunctionalComponent<{
  correspondingAnswer: SmartSnippetFeedback | 'other';
  currentAnswer?: SmartSnippetFeedback | 'other';
  i18n: i18n;
  id: string;
  localeKey: string;
  onChange: (e: Event) => void;
}> = ({correspondingAnswer, currentAnswer, i18n, id, localeKey, onChange}) => {
  return (
    <div class="flex items-center" key={id} part="reason">
      <input
        part="reason-radio"
        type="radio"
        name="answer"
        id={id}
        checked={currentAnswer === correspondingAnswer}
        onChange={onChange}
        class="mr-2 h-4 w-4"
        required
      />
      <label part="reason-label" htmlFor={id}>
        {i18n.t(localeKey)}
      </label>
    </div>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetFeedbackModalDetails: FunctionalComponent<{
  currentAnswer?: SmartSnippetFeedback | 'other';
  i18n: i18n;
  setDetailsInputRef: (ref?: HTMLTextAreaElement) => void;
}> = ({currentAnswer, i18n, setDetailsInputRef}) => {
  if (currentAnswer !== 'other') {
    return;
  }

  return (
    <fieldset>
      <legend part="details-title" class="text-on-background text-lg font-bold">
        {i18n.t('details')}
      </legend>
      <textarea
        part="details-input"
        name="answer-details"
        ref={setDetailsInputRef}
        class="border-neutral mt-2 w-full resize-none rounded border p-2 text-base leading-5"
        rows={4}
        required
      ></textarea>
    </fieldset>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetFeedbackModalFooter: FunctionalComponent<{
  formId: string;
  i18n: i18n;
  onClick: (e: MouseEvent) => void;
}> = ({formId, i18n, onClick}) => {
  return (
    <div part="buttons" slot="footer" class="flex justify-end gap-2">
      <Button
        part="cancel-button"
        style="outline-neutral"
        class="text-primary"
        onClick={onClick}
      >
        {i18n.t('cancel')}
      </Button>
      <Button part="submit-button" style="primary" type="submit" form={formId}>
        {i18n.t('feedback-send')}
      </Button>
    </div>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const smartSnippetFeedbackOptions: {
  id: string;
  localeKey: string;
  correspondingAnswer: SmartSnippetFeedback | 'other';
}[] = [
  {
    id: 'does-not-answer',
    localeKey: 'smart-snippet-feedback-reason-does-not-answer',
    correspondingAnswer: 'does_not_answer',
  },
  {
    id: 'partially-answers',
    localeKey: 'smart-snippet-feedback-reason-partially-answers',
    correspondingAnswer: 'partially_answers',
  },
  {
    id: 'was-not-a-question',
    localeKey: 'smart-snippet-feedback-reason-was-not-a-question',
    correspondingAnswer: 'was_not_a_question',
  },
  {
    id: 'other',
    localeKey: 'smart-snippet-feedback-reason-other',
    correspondingAnswer: 'other',
  },
];
