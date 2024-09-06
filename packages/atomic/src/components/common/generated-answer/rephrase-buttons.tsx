import {GeneratedAnswerStyle} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import BulletsIcon from '../../../images/bullets.svg';
import IdeaIcon from '../../../images/idea.svg';
import StepsIcon from '../../../images/steps.svg';
import TextIcon from '../../../images/text.svg';
import {Button} from '../button';

interface RephraseOption {
  value: GeneratedAnswerStyle;
  icon: string;
  titleKey: string;
  tooltipKey: string;
}

const options: RephraseOption[] = [
  {
    value: 'default',
    icon: TextIcon,
    titleKey: 'auto',
    tooltipKey: 'auto-tooltip',
  },
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
    icon: IdeaIcon,
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
    <div part="rephrase-buttons" class="shrink-0">
      <p part="rephrase-label" class="text-neutral-dark mb-2 shrink-0">
        {i18n.t('rephrase')}
      </p>
      <div
        part="rephrase-buttons-container"
        class="ml-auto flex flex-wrap gap-2 rounded-md border border-solid p-1"
      >
        {options.map((option) => {
          const isActive = props.answerStyle === option.value;
          return (
            <Button
              title={i18n.t(option.tooltipKey)}
              part="rephrase-button"
              style="text-transparent"
              class={`flex items-center rounded ${isActive ? 'active' : ''}`}
              onClick={() => {
                props.onChange(option.value);
              }}
              ariaPressed={String(isActive)}
            >
              <div class="icon-container text-neutral-dark relative mx-auto h-full shrink-0">
                <atomic-icon icon={option.icon}></atomic-icon>
              </div>
              <div
                part="rephrase-button-label"
                class="text-neutral-dark hidden"
              >
                {i18n.t(option.titleKey)}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
