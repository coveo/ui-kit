import type {i18n} from 'i18next';
import {html} from 'lit';
import {localizedString} from '@/src/directives/localized-string';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';
import CloseIcon from '../../../images/close.svg';
import {ATOMIC_MODAL_EXPORT_PARTS} from '../atomic-modal/export-parts';
import '../atomic-modal/atomic-modal';
import {renderButton} from '../button';
import '../atomic-icon/atomic-icon';

type RefineModalFooterButtonTextKey = 'view-products' | 'view-results';
interface RefineModalProps {
  host: HTMLElement;
  i18n: i18n;
  i18nFooterButtonTextKey: RefineModalFooterButtonTextKey;
  onClose(): void;
  title: string;
  numberOfItems: number;
  isOpen: boolean;
  openButton?: HTMLElement;
  boundary?: 'page' | 'element';
  scope?: HTMLElement;
}

export const renderRefineModal: FunctionalComponentWithChildren<
  RefineModalProps
> =
  ({props}) =>
  (children) => {
    const flushFacetElements = () => {
      props.host.querySelector('div[slot="facets"]')?.remove();
    };

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
              ${props.i18n.t(props.i18nFooterButtonTextKey)}
            </span>
            <span part="footer-button-count">
              ${localizedString({
                i18n: props.i18n,
                key: 'between-parentheses',
                params: {
                  text: props.numberOfItems.toLocaleString(props.i18n.language),
                },
              })}
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
        .onAnimationEnded=${() => {
          if (!props.isOpen) {
            flushFacetElements();
          }
        }}
        exportparts=${ATOMIC_MODAL_EXPORT_PARTS}
        .boundary=${props.boundary ?? 'page'}
        .scope=${props.scope}
      >
        ${renderHeader()} ${children} ${renderFooter()}
      </atomic-modal>
    `;
  };
