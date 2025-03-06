import {
  FunctionalComponent,
  FunctionalComponentWithChildren,
} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import {button, ButtonProps} from '../button';
import {radioButton, RadioButtonProps} from '../radio-button';

interface PagerNavigationButtonProps
  extends Omit<ButtonProps, 'style' | 'part' | 'class'> {
  icon: string;
  i18n: i18n;
}

export const pagerPreviousButton: FunctionalComponent<
  PagerNavigationButtonProps
> = ({props}) => {
  return button({
    props: {
      ...props,
      ariaLabel: props.i18n.t('previous'),
      style: 'outline-primary',
      part: 'previous-button',
      class:
        'flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center p-1',
    },
    children: html`<atomic-icon
      icon=${props.icon}
      part="previous-button-icon"
      class="w-5 align-middle"
    ></atomic-icon>`,
  });
};

export const pagerNextButton: FunctionalComponent<
  PagerNavigationButtonProps
> = ({props}) => {
  return button({
    props: {
      ...props,
      ariaLabel: props.i18n.t('next'),
      style: 'outline-primary',
      part: 'next-button',
      class:
        'flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center p-1',
    },
    children: html`<atomic-icon
      icon=${props.icon}
      part="next-button-icon"
      class="w-5 align-middle"
    ></atomic-icon>`,
  });
};

interface PagerPageButtonProps
  extends Omit<
    RadioButtonProps,
    'part' | 'style' | 'checked' | 'ariaCurrent' | 'key' | 'class'
  > {
  page: number;
  isSelected: boolean;
  text: string;
}

export const pagerPageButton: FunctionalComponent<PagerPageButtonProps> = ({
  props,
}) => {
  return radioButton({
    props: {
      ...props,
      selectWhenFocused: false,
      key: props.page,
      style: 'outline-neutral',
      checked: props.isSelected,
      ariaCurrent: props.isSelected ? 'page' : 'false',
      class:
        'btn-page focus-visible:bg-neutral-light min-h-[2.5rem] min-w-[2.5rem] p-1',
      part: `page-button${props.isSelected ? ' active-page-button' : ''}`,
    },
  });
};

interface PagerPageButtonsProps {
  i18n: i18n;
}

export const pagerPageButtons: FunctionalComponentWithChildren<
  PagerPageButtonsProps
> = ({props, children}) => {
  return html` <div
    part="page-buttons"
    role="radiogroup"
    aria-label=${props.i18n.t('pagination')}
    class="contents"
  >
    ${children}
  </div>`;
};
