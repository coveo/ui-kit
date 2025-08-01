import {html} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderRadioButton} from '../radio-button';

interface ChoicesProps {
  label: string;
  groupName: string;
  pageSize: number;
  choices: number[];
  lang: string;
  scrollToTopEvent: () => void;
  setItemSize: (size: number) => void;
  focusOnFirstResultAfterNextSearch: () => Promise<void> | undefined;
  focusOnNextNewResult: () => void;
}

export const renderChoices: FunctionalComponent<ChoicesProps> = ({props}) => {
  const {
    label,
    groupName,
    pageSize,
    choices,
    lang,
    scrollToTopEvent,
    setItemSize,
    focusOnFirstResultAfterNextSearch,
    focusOnNextNewResult,
  } = props;

  const focusOnProperResultDependingOnChoice = (choice: number) => {
    if (choice < pageSize) {
      focusOnFirstResultAfterNextSearch()?.then(() => scrollToTopEvent());
    } else if (choice > pageSize) {
      focusOnNextNewResult();
    }
  };

  return html`
    <div
      part="buttons"
      role="radiogroup"
      aria-label=${label}
      class="flex flex-wrap gap-2"
    >
      ${choices.map((choice) => {
        const isSelected = pageSize === choice;
        const parts = ['button'];
        if (isSelected) {
          parts.push('active-button');
        }
        const text = choice.toLocaleString(lang);
        return renderRadioButton({
          props: {
            key: 'choice',
            groupName,
            style: 'outline-neutral',
            checked: isSelected,
            ariaLabel: text,
            onChecked: () => {
              focusOnProperResultDependingOnChoice(choice);
              setItemSize(choice);
            },
            class: 'btn-page focus-visible:bg-neutral-light',
            part: parts.join(' '),
            text,
            selectWhenFocused: false,
          },
        });
      })}
    </div>
  `;
};
