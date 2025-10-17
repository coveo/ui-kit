import '@/src/components/common/atomic-icon/atomic-icon';
import type {i18n} from 'i18next';
import {html} from 'lit';
import type {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';
import {type ButtonProps, renderButton} from '../button';
import {type RadioButtonProps, renderRadioButton} from '../radio-button';

interface PagerNavigationButtonProps
  extends Omit<ButtonProps, 'style' | 'part' | 'class'> {
  icon: string;
  i18n: i18n;
}

export const renderPagerPreviousButton: FunctionalComponent<
  PagerNavigationButtonProps
> = ({props}) => {
  return renderButton({
    props: {
      ...props,
      ariaLabel: props.i18n.t('previous'),
      style: 'outline-primary',
      part: 'previous-button',
      class: 'flex min-h-10 min-w-10 items-center justify-center p-1',
    },
  })(
    html`<atomic-icon
      icon=${props.icon}
      part="previous-button-icon"
      class="w-5 align-middle"
    ></atomic-icon>`
  );
};

export const renderPagerNextButton: FunctionalComponent<
  PagerNavigationButtonProps
> = ({props}) => {
  return renderButton({
    props: {
      ...props,
      ariaLabel: props.i18n.t('next'),
      style: 'outline-primary',
      part: 'next-button',
      class: 'flex min-h-10 min-w-10 items-center justify-center p-1',
    },
  })(
    html`<atomic-icon
      icon=${props.icon}
      part="next-button-icon"
      class="w-5 align-middle"
    ></atomic-icon>`
  );
};

interface PagerPageButtonProps
  extends Omit<
    RadioButtonProps,
    'part' | 'style' | 'checked' | 'ariaCurrent' | 'key' | 'class'
  > {
  page: number;
  isSelected: boolean;
  text: string;
  onFocusCallback?: (
    elements: HTMLInputElement[],
    previousFocus: HTMLInputElement,
    newFocus: HTMLInputElement
  ) => Promise<void>;
}

export const renderPagerPageButton: FunctionalComponent<
  PagerPageButtonProps
> = ({props}) => {
  return renderRadioButton({
    props: {
      ...props,
      selectWhenFocused: false,
      key: props.page,
      style: 'outline-neutral',
      checked: props.isSelected,
      ariaCurrent: props.isSelected ? 'page' : 'false',
      class: 'btn-page focus-visible:bg-neutral-light min-h-10 min-w-10 p-1',
      part: `page-button${props.isSelected ? ' active-page-button' : ''}`,
      onFocusCallback: props.onFocusCallback,
      ariaRoleDescription: 'link',
    },
  });
};

interface PagerPageButtonsProps {
  i18n: i18n;
}

export const renderPageButtons: FunctionalComponentWithChildren<
  PagerPageButtonsProps
> =
  ({props}) =>
  (children) => {
    return html` <div
      part="page-buttons"
      role="radiogroup"
      aria-label=${props.i18n.t('pagination')}
      class="contents"
    >
      ${children}
    </div>`;
  };
