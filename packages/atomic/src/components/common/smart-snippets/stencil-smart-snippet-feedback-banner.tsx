import {h, FunctionalComponent} from '@stencil/core';
import {i18n} from 'i18next';
import Checkmark from '../../../images/checkmark.svg';
import Cross from '../../../images/cross.svg';
import {Button} from '../stencil-button';
import {RadioButton} from '../stencil-radio-button';

interface SmartSnippetFeedbackBannerProps {
  i18n: i18n;
  id: string;
  liked: boolean;
  disliked: boolean;
  feedbackSent: boolean;
  onLike(): void;
  onDislike(): void;
  onPressExplainWhy(): void;
  explainWhyRef?(element?: HTMLButtonElement): void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const SmartSnippetFeedbackBanner: FunctionalComponent<
  SmartSnippetFeedbackBannerProps
> = (props) => {
  const inquiryId = 'feedback-inquiry-' + props.id;
  const thankYouId = 'feedback-thank-you-' + props.id;
  const radioGroupName = 'feedback-options-' + props.id;

  const Inquiry = () => (
    <span id={inquiryId} part="feedback-inquiry" class="shrink-0">
      {props.i18n.t('smart-snippet-feedback-inquiry')}
    </span>
  );

  const Buttons = () => (
    <div part="feedback-buttons" class="flex gap-x-4">
      <label
        part="feedback-like-button"
        class={
          'flex items-center gap-x-1.5 ' +
          (props.liked ? 'text-success' : 'cursor-pointer hover:underline')
        }
      >
        <atomic-icon icon={Checkmark} class="w-3.5"></atomic-icon>
        <RadioButton
          groupName={radioGroupName}
          text={props.i18n.t('yes')}
          checked={props.liked}
          onChecked={() => props.onLike()}
          class="cursor-[inherit] text-[inherit]"
        ></RadioButton>
      </label>
      <label
        part="feedback-dislike-button"
        class={
          'flex items-center gap-x-1.5 ' +
          (props.disliked ? 'text-error' : 'cursor-pointer hover:underline')
        }
      >
        <atomic-icon icon={Cross} class="w-3.5"></atomic-icon>
        <RadioButton
          groupName={radioGroupName}
          text={props.i18n.t('no')}
          checked={props.disliked}
          onChecked={() => props.onDislike()}
          class="cursor-[inherit] text-[inherit]"
        ></RadioButton>
      </label>
    </div>
  );

  const ThankYouMessage = () => (
    <span id={thankYouId} part="feedback-thank-you" class="inline-flex">
      {props.i18n.t('smart-snippet-feedback-thanks')}
    </span>
  );

  const ExplainWhyButton = () => (
    <Button
      part="feedback-explain-why-button"
      style="text-primary"
      onClick={() => props.onPressExplainWhy()}
      ref={(element) => props.explainWhyRef?.(element)}
    >
      {props.i18n.t('smart-snippet-feedback-explain-why')}
    </Button>
  );

  const ThankYouContainer = ({visible}: {visible: boolean}) =>
    visible ? (
      <div part="feedback-thank-you-wrapper" class="flex flex-wrap gap-1">
        <ThankYouMessage></ThankYouMessage>
        {props.disliked && !props.feedbackSent ? (
          <ExplainWhyButton></ExplainWhyButton>
        ) : (
          []
        )}
      </div>
    ) : (
      []
    );

  return (
    <div
      part="feedback-banner"
      class="flex flex-wrap items-center gap-4 text-sm leading-4"
    >
      <div
        part="feedback-inquiry-and-buttons"
        role="radiogroup"
        aria-labelledby={inquiryId}
        class="inline-flex flex-wrap gap-4"
      >
        <Inquiry></Inquiry>
        <Buttons></Buttons>
      </div>
      <ThankYouContainer
        visible={props.liked || props.disliked}
      ></ThankYouContainer>
    </div>
  );
};
