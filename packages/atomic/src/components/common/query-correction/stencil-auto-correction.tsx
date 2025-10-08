import {FunctionalComponent, h, Fragment} from '@stencil/core';
import {i18n} from 'i18next';
import {LocalizedString} from '../../../utils/jsx-utils';

interface AutoCorrectionProps {
  i18n: i18n;
  originalQuery: string;
  correctedTo: string;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const AutoCorrection: FunctionalComponent<AutoCorrectionProps> = ({
  i18n,
  correctedTo,
  originalQuery,
}) => {
  return (
    <Fragment>
      <p class="text-on-background mb-1" part="no-results">
        <LocalizedString
          i18n={i18n}
          key={'no-results-for-did-you-mean'}
          params={{query: <b part="highlight">{originalQuery}</b>}}
        />
      </p>
      <p class="text-on-background" part="auto-corrected">
        <LocalizedString
          i18n={i18n}
          key={'query-auto-corrected-to'}
          params={{query: <b part="highlight">{correctedTo}</b>}}
        />
      </p>
    </Fragment>
  );
};
