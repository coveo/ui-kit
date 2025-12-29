import type {GeneratedAnswerState} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {when} from 'lit/directives/when.js';
import {renderCopyButton} from '@/src/components/common/generated-answer/copy-button';
import {renderFeedbackButton} from '@/src/components/common/generated-answer/feedback-button';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {hasClipboardSupport} from './generated-answer-utils';

export interface RenderFeedbackAndCopyButtonsProps {
  i18n: i18n;
  generatedAnswerState: GeneratedAnswerState | undefined;
  withToggle?: boolean;
  copied: boolean;
  copyError: boolean;
  getCopyToClipboardTooltip: () => string;
  onClickLike: () => void;
  onClickDislike: () => void;
  onCopyToClipboard: (answer: string) => Promise<void>;
}

/**
 * Renders the feedback (like/dislike) and copy-to-clipboard buttons.
 */
export const renderFeedbackAndCopyButtons: FunctionalComponent<
  RenderFeedbackAndCopyButtonsProps
> = ({props}) => {
  const {
    i18n,
    generatedAnswerState,
    withToggle,
    copied,
    copyError,
    getCopyToClipboardTooltip,
    onClickLike,
    onClickDislike,
    onCopyToClipboard,
  } = props;

  const {liked, disliked, answer, isStreaming} = generatedAnswerState ?? {};

  return html`${when(
    !isStreaming,
    () => html`
      <div
        class="${classMap({
          'feedback-buttons flex h-9 absolute top-6 shrink-0 gap-2': true,
          'right-20': !!withToggle,
          'right-6': !withToggle,
        })}"
      >
        ${renderFeedbackButton({
          props: {
            title: i18n.t('this-answer-was-helpful'),
            variant: 'like',
            active: !!liked,
            onClick: onClickLike,
          },
        })}
        ${renderFeedbackButton({
          props: {
            title: i18n.t('this-answer-was-not-helpful'),
            variant: 'dislike',
            active: !!disliked,
            onClick: onClickDislike,
          },
        })}
        ${
          hasClipboardSupport()
            ? renderCopyButton({
                props: {
                  title: getCopyToClipboardTooltip(),
                  isCopied: copied,
                  error: copyError,
                  onClick: async () => {
                    if (answer) {
                      await onCopyToClipboard(answer);
                    }
                  },
                },
              })
            : nothing
        }
      </div>
    `
  )}`;
};
