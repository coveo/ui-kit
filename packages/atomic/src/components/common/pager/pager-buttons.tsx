import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button, StencilButtonProps} from '../stencil-button';
import {RadioButton, StencilRadioButtonProps} from '../stencil-radio-button';

export interface PagerNavigationButtonProps
  extends Omit<StencilButtonProps, 'style' | 'part' | 'class'> {
  icon: string;
  i18n: i18n;
}

export interface PagerPageButtonProps
  extends Omit<
    StencilRadioButtonProps,
    'part' | 'style' | 'checked' | 'ariaCurrent' | 'key' | 'class'
  > {
  page: number;
  isSelected: boolean;
  text: string;
}

export interface PagerPageButtonsProps {
  i18n: i18n;
}

export const PagerPreviousButton: FunctionalComponent<
  PagerNavigationButtonProps
> = (props) => {
  return (
    <Button
      {...props}
      ariaLabel={props.i18n.t('previous')}
      style="outline-primary"
      part="previous-button"
      class="flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center p-1"
    >
      <atomic-icon
        icon={props.icon}
        part="previous-button-icon"
        class="w-5 align-middle"
      ></atomic-icon>
    </Button>
  );
};

export const PagerNextButton: FunctionalComponent<
  PagerNavigationButtonProps
> = (props) => {
  return (
    <Button
      {...props}
      ariaLabel={props.i18n.t('next')}
      style="outline-primary"
      part="next-button"
      class="flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center p-1"
    >
      <atomic-icon
        icon={props.icon}
        part="next-button-icon"
        class="w-5 align-middle"
      ></atomic-icon>
    </Button>
  );
};

export const PagerPageButton: FunctionalComponent<PagerPageButtonProps> = (
  props
) => {
  return (
    <RadioButton
      {...props}
      selectWhenFocused={false}
      key={props.page}
      style="outline-neutral"
      checked={props.isSelected}
      ariaCurrent={props.isSelected ? 'page' : 'false'}
      class="btn-page focus-visible:bg-neutral-light min-h-[2.5rem] min-w-[2.5rem] p-1"
      part={`page-button${props.isSelected ? ' active-page-button' : ''}`}
    ></RadioButton>
  );
};

export const PagerPageButtons: FunctionalComponent<PagerPageButtonsProps> = (
  props,
  children
) => {
  return (
    <div
      part="page-buttons"
      role="radiogroup"
      aria-label={props.i18n.t('pagination')}
      class="contents"
    >
      {...children}
    </div>
  );
};
