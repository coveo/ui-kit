import type {SmartSnippetFeedback} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface ModalOptionProps {
  correspondingAnswer: SmartSnippetFeedback | 'other';
  currentAnswer?: SmartSnippetFeedback | 'other';
  i18n: i18n;
  id: string;
  localeKey: string;
  onChange: (e: Event) => void;
}

export const renderModalOption: FunctionalComponent<ModalOptionProps> = ({
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
