import type {SmartSnippetFeedback} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {type RefOrCallback, ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface ModalDetailsProps {
  currentAnswer: SmartSnippetFeedback | 'other';
  i18n: i18n;
  detailsInputRef: RefOrCallback;
}

export const renderModalDetails: FunctionalComponent<ModalDetailsProps> = ({
  props: {currentAnswer, i18n, detailsInputRef},
}) =>
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
          ${ref(detailsInputRef)}
          class="border-neutral mt-2 w-full resize-none rounded border p-2 text-base leading-5"
          rows=${4}
          required
        ></textarea>
      </fieldset>`
  );
