import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import '@/src/components/common/atomic-icon/atomic-icon';
import {renderButton} from '@/src/components/common/button';
import {hasClipboardSupport} from './generated-answer-utils';
import CopyIcon from '../../../images/copy.svg';

export interface RenderConversationDebugHeaderProps {
  i18n: i18n;
  conversationId: string;
}

export const renderConversationDebugHeader: FunctionalComponent<
  RenderConversationDebugHeaderProps
> = ({props}) => {
  const {i18n, conversationId} = props;
  return html`<div class="flex h-9 gap-1.5 items-center text-neutral-dark">
    ${i18n.t('generated-answer-debug-mode-on')}
    <div class="bg-success h-2 w-2 rounded-full"></div>
    <div class="flex items-center text-neutral-dark">
      ${i18n.t('generated-answer-conversation-id', {conversationId})}
      ${hasClipboardSupport()
        ? renderButton({
            props: {
              style: 'text-transparent',
              class: 'p-2 flex items-center',
              title: i18n.t('generated-answer-copy-conversation-id'),
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
