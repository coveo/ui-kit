import type {i18n} from 'i18next';
import {html} from 'lit';
import type {RefOrCallback} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {multiClassMap} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import Checkmark from '../../../images/checkmark.svg';
import Cross from '../../../images/cross.svg';
import {renderButton} from '../button';
import {renderRadioButton} from '../radio-button';

export interface SmartSnippetFeedbackBannerProps {
  i18n: i18n;
  id: string;
  liked: boolean;
  disliked: boolean;
  feedbackSent: boolean;
  onLike(): void;
  onDislike(): void;
  onPressExplainWhy(): void;
  explainWhyRef?: RefOrCallback;
}

export const renderSmartSnippetFeedbackBanner: FunctionalComponent<
  SmartSnippetFeedbackBannerProps
> = ({props}) => {
  const inquiryId = `feedback-inquiry-${props.id}`;
  const thankYouId = `feedback-thank-you-${props.id}`;
  const radioGroupName = `feedback-options-${props.id}`;

  const renderInquiry = () =>
    html`<span id=${inquiryId} part="feedback-inquiry" class="shrink-0">
      ${props.i18n.t('smart-snippet-feedback-inquiry')}
    </span>`;

  const renderButtons = () =>
    html`<div part="feedback-buttons" class="flex gap-x-4">
      <label
        part="feedback-like-button"
        class=${multiClassMap({
          flex: true,
          'items-center': true,
          'gap-x-1.5': true,
          'text-success': props.liked,
          'cursor-pointer': !props.liked,
          'hover:underline': !props.liked,
        })}
      >
        <atomic-icon icon=${Checkmark} class="w-3.5"></atomic-icon>
        ${renderRadioButton({
          props: {
            groupName: radioGroupName,
            text: props.i18n.t('yes'),
            checked: props.liked,
            onChecked: () => props.onLike(),
            class: 'cursor-[inherit] text-[inherit]',
          },
        })}
      </label>
      <label
        part="feedback-dislike-button"
        class=${multiClassMap({
          flex: true,
          'items-center': true,
          'gap-x-1.5': true,
          'text-error': props.disliked,
          'cursor-pointer': !props.disliked,
          'hover:underline': !props.disliked,
        })}
      >
        <atomic-icon icon=${Cross} class="w-3.5"></atomic-icon>
        ${renderRadioButton({
          props: {
            groupName: radioGroupName,
            text: props.i18n.t('no'),
            checked: props.disliked,
            onChecked: () => props.onDislike(),
            class: 'cursor-[inherit] text-[inherit]',
          },
        })}
      </label>
    </div>`;

  const renderThankYouMessage = () =>
    html`<span id=${thankYouId} part="feedback-thank-you" class="inline-flex">
      ${props.i18n.t('smart-snippet-feedback-thanks')}
    </span>`;

  const renderExplainWhyButton = () =>
    renderButton({
      props: {
        style: 'text-primary',
        part: 'feedback-explain-why-button',
        onClick: () => props.onPressExplainWhy(),
        ref: props.explainWhyRef,
      },
    })(html`${props.i18n.t('smart-snippet-feedback-explain-why')}`);

  const renderThankYouContainer = (visible: boolean) =>
    when(
      visible,
      () =>
        html`<div part="feedback-thank-you-wrapper" class="flex flex-wrap gap-1">
          ${renderThankYouMessage()}
          ${when(props.disliked && !props.feedbackSent, () =>
            renderExplainWhyButton()
          )}
        </div>`
    );

  return html`<div
    part="feedback-banner"
    class="flex flex-wrap items-center gap-4 text-sm leading-4"
  >
    <div
      part="feedback-inquiry-and-buttons"
      role="radiogroup"
      aria-labelledby=${inquiryId}
      class="inline-flex flex-wrap gap-4"
    >
      ${renderInquiry()} ${renderButtons()}
    </div>
    ${renderThankYouContainer(props.liked || props.disliked)}
  </div>`;
};
