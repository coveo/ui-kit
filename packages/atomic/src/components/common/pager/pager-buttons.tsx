import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button, ButtonProps} from '../button';
import {RadioButton, RadioButtonProps} from '../radio-button';

export interface PagerNavigationButtonProps
  extends Omit<ButtonProps, 'style' | 'part' | 'class'> {
  icon: string;
  i18n: i18n;
}

export interface PagerPageButtonProps
  extends Omit<
    RadioButtonProps,
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
      class="p-1 min-w-[2.5rem] min-h-[2.5rem] flex justify-center items-center"
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
      class="p-1 min-w-[2.5rem] min-h-[2.5rem] flex justify-center items-center"
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
      key={props.page}
      style="outline-neutral"
      checked={props.isSelected}
      ariaCurrent={props.isSelected ? 'page' : 'false'}
      class="btn-page focus-visible:bg-neutral-light p-1 min-w-[2.5rem] min-h-[2.5rem]"
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
