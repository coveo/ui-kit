import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {LocalizedString} from '../../../utils/jsx-utils';

interface CorrectionProps {
  i18n: i18n;
  onClick: () => void;
  correctedQuery: string;
}
export const Correction: FunctionalComponent<CorrectionProps> = ({
  i18n,
  onClick,
  correctedQuery,
}) => {
  return (
    <p class="text-on-background" part="did-you-mean">
      <LocalizedString
        i18n={i18n}
        key="did-you-mean"
        params={{
          query: (
            <button
              class="link py-1"
              part="correction-btn"
              onClick={() => onClick()}
            >
              {correctedQuery}
            </button>
          ),
        }}
      />
    </p>
  );
};
