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
          ></RadioButton>
        );
      })}
    </div>
  );
};
