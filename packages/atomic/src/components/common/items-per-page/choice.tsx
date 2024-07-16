import {FunctionalComponent, h} from '@stencil/core';
import {RadioButton} from '../radio-button';

interface ChoiceProps {
  groupName: string;
  pageSize: number;
  onChecked: () => void;
  choice: number;
  language: string;
}

export const Choice: FunctionalComponent<ChoiceProps> = ({
  groupName,
  pageSize,
  onChecked,
  choice,
  language,
}) => {
  const isSelected = pageSize === choice;

  const parts = ['button'];
  if (isSelected) {
    parts.push('active-button');
  }

  const text = choice.toLocaleString(language);

  return (
    <RadioButton
      key={'choice'}
      groupName={groupName}
      style="outline-neutral"
      checked={isSelected}
      ariaLabel={text}
      onChecked={onChecked}
      class="btn-page focus-visible:bg-neutral-light"
      part={parts.join(' ')}
      text={text}
    ></RadioButton>
  );
};
