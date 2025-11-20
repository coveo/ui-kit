import type {SmartSnippetFeedback} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {type RefOrCallback, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderButton} from '@/src/components/common/button';
import type {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';

export interface SmartSnippetFeedbackModalHeaderProps {
  i18n: i18n;
}

export const renderSmartSnippetFeedbackModalHeader: FunctionalComponent<
  SmartSnippetFeedbackModalHeaderProps
> = ({props: {i18n}}) =>
  html`<h1 slot="header">${i18n.t('smart-snippet-feedback-explain-why')}</h1>`;

export interface SmartSnippetFeedbackModalBodyProps {
  formId: string;
  onSubmit: (e: Event) => void;
}

export const renderSmartSnippetFeedbackModalBody: FunctionalComponentWithChildren<
  SmartSnippetFeedbackModalBodyProps
> =
  ({props: {formId, onSubmit}}) =>
  (children) =>
    html`<form
      part="form"
      id=${formId}
      slot="body"
      @submit=${onSubmit}
      class="flex flex-col gap-8"
    >
      ${children}
    </form>`;

export interface SmartSnippetFeedbackModalOptionsProps {
  i18n: i18n;
}

export const renderSmartSnippetFeedbackModalOptions: FunctionalComponentWithChildren<
  SmartSnippetFeedbackModalOptionsProps
> =
  ({props: {i18n}}) =>
  (children) =>
    html`<fieldset>
      <legend part="reason-title" class="text-on-background text-lg font-bold">
        ${i18n.t('smart-snippet-feedback-select-reason')}
      </legend>
      ${children}
    </fieldset>`;

export interface SmartSnippetFeedbackModalOptionProps {
  correspondingAnswer: SmartSnippetFeedback | 'other';
  currentAnswer?: SmartSnippetFeedback | 'other';
  i18n: i18n;
  id: string;
  localeKey: string;
  onChange: (e: Event) => void;
}

export const renderSmartSnippetFeedbackModalOption: FunctionalComponent<
  SmartSnippetFeedbackModalOptionProps
> = ({
  props: {correspondingAnswer, currentAnswer, i18n, id, localeKey, onChange},
}) =>
  html`<div class="flex items-center" part="reason">
    <input
      part="reason-radio"
      type="radio"
      name="answer"
      id=${id}
      ?checked=${currentAnswer === correspondingAnswer}
      @change=${onChange}
      class="mr-2 h-4 w-4"
      required
    />
    <label part="reason-label" for=${id}> ${i18n.t(localeKey)} </label>
  </div>`;

export interface SmartSnippetFeedbackModalDetailsProps {
  currentAnswer?: SmartSnippetFeedback | 'other';
  i18n: i18n;
  detailsInputRef?: RefOrCallback;
}

export const renderSmartSnippetFeedbackModalDetails: FunctionalComponent<
  SmartSnippetFeedbackModalDetailsProps
> = ({props: {currentAnswer, i18n, detailsInputRef}}) =>
  when(
    currentAnswer === 'other',
    () =>
      html`<fieldset>
        <legend
          part="details-title"
          class="text-on-background text-lg font-bold"
        >
          ${i18n.t('details')}
        </legend>
        <textarea
          part="details-input"
          name="answer-details"
          ${detailsInputRef ? ref(detailsInputRef) : ''}
          class="border-neutral mt-2 w-full resize-none rounded border p-2 text-base leading-5"
          rows="4"
          required
        ></textarea>
      </fieldset>`
  );

export interface SmartSnippetFeedbackModalFooterProps {
  formId: string;
  i18n: i18n;
  onClick: (e: MouseEvent) => void;
}

export const renderSmartSnippetFeedbackModalFooter: FunctionalComponent<
  SmartSnippetFeedbackModalFooterProps
> = ({props: {formId, i18n, onClick}}) =>
  html`<div part="buttons" slot="footer" class="flex justify-end gap-2">
    ${renderButton({
      props: {
        part: 'cancel-button',
        style: 'outline-neutral',
        class: 'text-primary',
        onClick,
      },
    })(i18n.t('cancel'))}
    ${renderButton({
      props: {
        part: 'submit-button',
        style: 'primary',
        type: 'submit',
        form: formId,
      },
    })(i18n.t('feedback-send'))}
  </div>`;

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
