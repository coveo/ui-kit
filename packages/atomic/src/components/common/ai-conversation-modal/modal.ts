import type {i18n} from 'i18next';
import {html} from 'lit';
import {localizedString} from '@/src/directives/localized-string';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import CloseIcon from '../../../images/close.svg';
import {ATOMIC_MODAL_EXPORT_PARTS} from '../atomic-modal/export-parts';
import '../atomic-modal/atomic-modal';
import {renderButton} from '../button';
import '../atomic-icon/atomic-icon';

interface AIConversationModalProps {
  host: HTMLElement;
  i18n: i18n;
  onClose(): void;
  title: string;
  isOpen: boolean;
  openButton?: HTMLElement;
  boundary?: 'page' | 'element';
  scope?: HTMLElement;
}

export const renderAIConversationModal: FunctionalComponentWithChildren<
  AIConversationModalProps
> =
  ({props}) =>
  (children) => {

    const renderHeader = () => {
      return html`
        <div slot="header" class="contents">
          <h1 part="title" class="truncate">${props.title}</h1>
          ${renderButton({
            props: {
              style: 'text-transparent',
              class: 'grid place-items-center',
              part: 'close-button',
              onClick: props.onClose,
              ariaLabel: props.i18n.t('close'),
            },
          })(
            html`<atomic-icon
              part="close-icon"
              class="h-5 w-5"
              icon=${CloseIcon}
            ></atomic-icon>`
          )}
        </div>
      `;
    };

    const renderFooter = () => {
      return html`
        <div part="footer-content" slot="footer">
          ${renderButton({
            props: {
              style: 'primary',
              part: 'footer-button',
              class: 'flex w-full justify-center p-3 text-lg',
              onClick: props.onClose,
            },
          })(html`
            <span part="footer-button-text" class="mr-1 truncate">
              ${'Close'}
            </span>
          `)}
        </div>
      `;
    };

    return html`
      <atomic-modal
        .fullscreen=${true}
        .isOpen=${props.isOpen}
        .source=${props.openButton}
        .container=${props.host}
        .close=${props.onClose}
        .onAnimationEnded=${() => {}}
        exportparts=${ATOMIC_MODAL_EXPORT_PARTS}
        .boundary=${props.boundary ?? 'page'}
        .scope=${props.scope}
      >
        ${renderHeader()} ${children} ${renderFooter()}
      </atomic-modal>
    `;
  };
