import {FunctionalComponent, Fragment, h} from '@stencil/core';
import {i18n} from 'i18next';
import {LocalizedString} from '../../../utils/jsx-utils';

interface TriggerCorrectionProps {
  i18n: i18n;
  correctedQuery: string;
  originalQuery: string;
  onClick: () => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const TriggerCorrection: FunctionalComponent<TriggerCorrectionProps> = ({
  i18n,
  correctedQuery,
  originalQuery,
  onClick,
}) => {
  return (
    <Fragment>
      <p
        class="text-on-background text-lg leading-6"
        part="showing-results-for"
      >
        <LocalizedString
          i18n={i18n}
          key={'showing-results-for'}
          params={{query: <b part="highlight">{correctedQuery}</b>}}
        />
      </p>
      <p
        class="text-on-background text-base leading-5"
        part="search-instead-for"
      >
        <LocalizedString
          i18n={i18n}
          key="search-instead-for"
          params={{
            query: (
              <button
                class="text-primary hover:text-primary-light focus-visible:text-primary-light py-1 hover:underline focus-visible:underline"
                part="undo-btn"
                onClick={() => onClick()}
              >
                {originalQuery}
              </button>
            ),
          }}
        />
      </p>
    </Fragment>
  );
};
