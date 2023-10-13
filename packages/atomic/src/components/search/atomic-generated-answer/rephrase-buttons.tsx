import {GeneratedAnswerStyle} from '@coveo/headless/dist/definitions/features/generated-answer/generated-response-format';
import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import BubbleIcon from '../../../images/bubble.svg';
import BulletsIcon from '../../../images/bullets.svg';
import StepsIcon from '../../../images/steps.svg';
import {Button} from '../../common/button';

interface RephraseOption {
  value: GeneratedAnswerStyle;
  icon: string;
  titleKey: string;
  tooltipKey: string;
}

const options: RephraseOption[] = [
  {
    value: 'step',
    icon: StepsIcon,
    titleKey: 'steps',
    tooltipKey: 'steps-tooltip',
  },
  {
    value: 'bullet',
    icon: BulletsIcon,
    titleKey: 'bullets',
    tooltipKey: 'bullets-tooltip',
  },
  {
    titleKey: 'summary',
    value: 'concise',
    icon: BubbleIcon,
    tooltipKey: 'summary',
  },
];

interface RephraseButtonProps {
  answerStyle: string;
  i18n: i18n;
  onChange: (answerStyle: GeneratedAnswerStyle) => void;
}

export const RephraseButtons: FunctionalComponent<RephraseButtonProps> = (
  props
) => {
  const {i18n} = props;
  return (
    <div class="rephrase-buttons shrink-0">
      <p part="rephrase-label" class="mb-2 text-neutral-dark shrink-0">
        {i18n.t('rephrase')}
      </p>
      <div class="flex flex-wrap gap-2 ml-auto">
        {options.map((option) => {
          const isActive = props.answerStyle === option.value;
          return (
            <Button
              title={i18n.t(option.tooltipKey)}
              part="rephrase-button"
              style="outline-primary"
              class={`feedback-button flex items-center rounded-md ${
                isActive ? 'active' : ''
              }`}
              onClick={() => {
                props.onChange(isActive ? 'default' : option.value);
              }}
              ariaPressed={String(isActive)}
            >
              <div class="icon-container text-neutral-dark h-full mx-auto shrink-0 relative">
                <atomic-icon icon={option.icon}></atomic-icon>
              </div>
              <div class="rephrase-btn-label hidden text-neutral-dark">
                {i18n.t(option.titleKey)}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
