import {FunctionalComponent, h} from '@stencil/core';
import {RadioButton} from '../radio-button';

interface ChoicesProps {
  label: string;
  groupName: string;
  pageSize: number;
  choices: number[];
  lang: string;
  scrollToTopEvent: () => {};
  setItemSize: (size: number) => void;
  focusOnFirstResultAfterNextSearch: () => Promise<void> | undefined;
  focusOnNextNewResult: () => void | undefined;
}

export const Choices: FunctionalComponent<ChoicesProps> = ({
  label,
  groupName,
  pageSize,
  choices,
  lang,
  scrollToTopEvent,
  setItemSize,
  focusOnFirstResultAfterNextSearch,
  focusOnNextNewResult,
}) => {
  const focusOnProperResultDependingOnChoice = (choice: number) => {
    if (choice < pageSize) {
      focusOnFirstResultAfterNextSearch()?.then(() => scrollToTopEvent());
    } else if (choice > pageSize) {
      focusOnNextNewResult();
    }
  };

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
    <div
      part="buttons"
      role="radiogroup"
      aria-label={label}
      class="flex flex-wrap gap-2"
    >
      {choices.map((choice) => {
        const isSelected = pageSize === choice;
        const parts = ['button'];
        if (isSelected) {
          parts.push('active-button');
        }
        const text = choice.toLocaleString(lang);
        return (
          <RadioButton
            key={'choice'}
            groupName={groupName}
            style="outline-neutral"
            checked={isSelected}
            ariaLabel={text}
            onChecked={() => {
              focusOnProperResultDependingOnChoice(choice);
              setItemSize(choice);
            }}
            class="btn-page focus-visible:bg-neutral-light"
            part={parts.join(' ')}
            text={text}
            onKeyDown={handleKeyDown} // Add the onKeyDown event handler
          ></RadioButton>
        );
      })}
    </div>
  );
};
