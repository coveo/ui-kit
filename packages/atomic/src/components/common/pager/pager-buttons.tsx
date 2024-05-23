import {FunctionalComponent, h} from '@stencil/core';
import {Button, ButtonProps} from '../button';
import {RadioButton, RadioButtonProps} from '../radio-button';

export interface PagerNavigationButtonProps
  extends Omit<ButtonProps, 'style' | 'part' | 'class'> {
  icon: string;
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

export const PagerPreviousButton: FunctionalComponent<
  PagerNavigationButtonProps
> = (props) => {
  return (
    <Button
      {...props}
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

export const PagerPageButtons: FunctionalComponent = (_, children) => {
  return (
    <div
      part="page-buttons"
      role="radiogroup"
      aria-label="Pagination"
      class="contents"
    >
      {...children}
    </div>
  );
};
