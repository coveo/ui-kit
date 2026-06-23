import {html, nothing} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import '@/src/components/common/atomic-icon/atomic-icon';
import {renderButton} from '@/src/components/common/button';
import {hasClipboardSupport} from './generated-answer-utils';
import CopyIcon from '../../../images/copy.svg';

export interface RenderConversationDebugHeaderProps {
  conversationId: string;
}

export const renderConversationDebugHeader: FunctionalComponent<
  RenderConversationDebugHeaderProps
> = ({props}) => {
  const {conversationId} = props;
  return html`<div
    class="flex h-9 gap-1.5 items-center"
    style="color: var(--atomic-neutral-dark);"
  >
    Debug mode ON
    <div
      style="background-color:var(--atomic-success); width: 8px; height: 8px; border-radius: 50%;"
    ></div>
    <div style="color: var(--atomic-neutral-dark);" class="flex items-center">
      Conversation ID:&nbsp;
      <div style="color: var(--atomic-on-background);">${conversationId}</div>
      ${hasClipboardSupport()
        ? renderButton({
            props: {
              style: 'text-transparent',
              class: 'rounded-md p-2',
              title: 'Copy conversation ID',
              onClick: () => {
                navigator.clipboard.writeText(conversationId).catch(() => {});
              },
            },
          })(
            html`<atomic-icon
              class="w-4 text-neutral-dark"
              .icon=${CopyIcon}
            ></atomic-icon>`
          )
        : nothing}
    </div>
  </div>`;
};
