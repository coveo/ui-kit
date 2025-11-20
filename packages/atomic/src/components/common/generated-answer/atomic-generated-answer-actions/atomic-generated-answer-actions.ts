import {css, html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import CopyIcon from '../../../../images/copy.svg';
import Thumbs from '../../../../images/thumbs.svg';
import {renderButton} from '../../button';
import '@/src/components/common/atomic-icon/atomic-icon';

interface GeneratedAnswerActionsProps {
  answer?: string;
  isLiked?: boolean;
  onLike: () => void;
  isDisliked?: boolean;
  onDislike: () => void;
}
export const renderGeneratedAnswerActions: FunctionalComponent<
  GeneratedAnswerActionsProps
> = ({props}) => {
  css`background-color: pink;`;
  return html`
    <div
      part="generated-answer-actions"
      class="feedback-buttons flex h-9 top-6 shrink-0 gap-2 right-6"
    >
      ${renderButton({
        props: {
          title: 'This answer was helpful',
          style: 'text-transparent',
          class: `feedback-button rounded-md p-2 like ${
            props.isLiked ? 'active' : ''
          }`,
          onClick: () => props.onLike(),
        },
      })(html`
        <atomic-icon class="w-5" .icon=${Thumbs}></atomic-icon>
      `)}
      ${renderButton({
        props: {
          title: 'This answer was helpful',
          style: 'text-transparent',
          class: `feedback-button rotate-180 rounded-md p-2 dislike ${
            props.isDisliked ? 'active' : ''
          }`,
          onClick: () => props.onDislike(),
        },
      })(html`
        <atomic-icon class="w-5" .icon=${Thumbs}></atomic-icon>
      `)}
      ${renderButton({
        props: {
          title: 'Copy answer to clipboard',
          style: 'text-transparent',
          part: 'copy-button',
          class: `rounded-md p-2`,
          onClick: async () => {
            if (props.answer) {
              await copyToClipboard(props.answer);
            }
          },
        },
      })(html`
        <div class="icon-container text-neutral-dark">
          <atomic-icon class="w-5" .icon=${CopyIcon}></atomic-icon>
        </div>
      `)}
    </div>
  `;
};

const copyToClipboard = async (answer: string) => {
  try {
    await navigator.clipboard.writeText(answer);
  } catch (error) {
    console.error(`Failed to copy to clipboard: ${error}`);
  }
};
