import {GeneratedAnswerStyle} from '@coveo/headless/dist/definitions/features/generated-answer/generated-response-format';
import {FunctionalComponent, h} from '@stencil/core';
import StepsIcon from '../.../../images/steps.svg';
import BubbleIcon from '../../../images/bubble.svg';
import BulletsIcon from '../../../images/bullets.svg';
import {Button} from '../../common/button';

interface RephraseOption {
  title: string;
  value: GeneratedAnswerStyle;
  icon: string;
  tooltip: string;
}

const options: RephraseOption[] = [
  {
    title: 'Steps',
    value: 'step',
    icon: StepsIcon,
    tooltip: 'Step-by-step instructions',
  },
  {
    title: 'Bullets',
    value: 'bullet',
    icon: BulletsIcon,
    tooltip: 'Bullet-point summary',
  },
  {
    title: 'Summary',
    value: 'concise',
    icon: BubbleIcon,
    tooltip: 'Summary',
  },
];

interface RephraseButtonProps {
  answerStyle: string;
  onChange: (answerStyle: GeneratedAnswerStyle) => void;
}

export const RephraseButtons: FunctionalComponent<RephraseButtonProps> = (
  props
) => {
  return (
    <div class="feedback-buttons flex gap-2 ml-auto">
      {options.map((option) => {
        const isActive = props.answerStyle === option.value;
        return (
          <Button
            title={option.title}
            style="text-neutral"
            class={`feedback-button p-2 rounded-md ${isActive ? 'active' : ''}`}
            onClick={() => {
              props.onChange(isActive ? 'default' : option.value);
            }}
            ariaPressed={String(isActive)}
          >
            <atomic-icon class="w-5" icon={option.icon}></atomic-icon>
          </Button>
        );
      })}
    </div>
  );
};
