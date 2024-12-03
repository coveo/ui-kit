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
  const handleKeyDown = (event: KeyboardEvent) => {
    const {key} = event;
    const radioGroup = (event.currentTarget as HTMLElement).parentNode;

    if (!radioGroup || !isArrowKey(key)) {
      return;
    }

    event.preventDefault();

    const buttons = getRadioButtons(radioGroup);
    const currentIndex = getCurrentIndex(
      buttons,
      event.currentTarget as HTMLInputElement
    );
    const newIndex = getNewIndex(key, currentIndex, buttons.length);

    if (buttons[newIndex]) {
      buttons[newIndex].focus();
    }
  };

  const isArrowKey = (key: string) => {
    return ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(key);
  };

  const getRadioButtons = (radioGroup: ParentNode) => {
    return Array.from(
      radioGroup.querySelectorAll('[type="radio"]')
    ) as HTMLInputElement[];
  };

  const getCurrentIndex = (
    buttons: HTMLInputElement[],
    currentButton: HTMLInputElement
  ) => {
    return buttons.findIndex((button) => button === currentButton);
  };

  const getNewIndex = (key: string, currentIndex: number, length: number) => {
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        return (currentIndex - 1 + length) % length;
      case 'ArrowRight':
      case 'ArrowDown':
        return (currentIndex + 1) % length;
      default:
        return currentIndex;
    }
  };

  return (
    <RadioButton
      {...props}
      onKeyDown={handleKeyDown}
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
