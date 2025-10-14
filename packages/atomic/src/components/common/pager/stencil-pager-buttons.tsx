import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button, StencilButtonProps} from '../stencil-button';
import {RadioButton, StencilRadioButtonProps} from '../stencil-radio-button';

interface PagerNavigationButtonProps
  extends Omit<StencilButtonProps, 'style' | 'part' | 'class'> {
  icon: string;
  i18n: i18n;
}

interface PagerPageButtonProps
  extends Omit<
    StencilRadioButtonProps,
    'part' | 'style' | 'checked' | 'ariaCurrent' | 'key' | 'class' | 'ref'
  > {
  page: number;
  isSelected: boolean;
  text: string;
}

interface PagerPageButtonsProps {
  i18n: i18n;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const PagerPreviousButton: FunctionalComponent<
  PagerNavigationButtonProps
> = (props) => {
  return (
    <Button
      {...props}
      ariaLabel={props.i18n.t('previous')}
      style="outline-primary"
      part="previous-button"
      class="flex min-h-10 min-w-10 items-center justify-center p-1"
    >
      <atomic-icon
        icon={props.icon}
        part="previous-button-icon"
        class="w-5 align-middle"
      ></atomic-icon>
    </Button>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const PagerNextButton: FunctionalComponent<
  PagerNavigationButtonProps
> = (props) => {
  return (
    <Button
      {...props}
      ariaLabel={props.i18n.t('next')}
      style="outline-primary"
      part="next-button"
      class="flex min-h-10 min-w-10 items-center justify-center p-1"
    >
      <atomic-icon
        icon={props.icon}
        part="next-button-icon"
        class="w-5 align-middle"
      ></atomic-icon>
    </Button>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
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
      class="btn-page focus-visible:bg-neutral-light min-h-10 min-w-10 p-1"
      part={`page-button${props.isSelected ? ' active-page-button' : ''}`}
    ></RadioButton>
  );
};

/**
 * @deprecated should only be used for Stencil components.
 */
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
