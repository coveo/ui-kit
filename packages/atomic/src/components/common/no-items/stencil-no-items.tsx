import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {LocalizedString} from '../../../utils/jsx-utils';

interface NoItemsProps {
  query: string;
  i18n: i18n;
  i18nKey: 'no-results' | 'no-products';
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const NoItems: FunctionalComponent<NoItemsProps> = ({
  i18n,
  query,
  i18nKey,
}) => {
  const content = query ? (
    <LocalizedString
      i18n={i18n}
      key={`${i18nKey}-for`}
      params={{
        query: (
          <span
            class="inline-block max-w-full truncate align-bottom font-bold whitespace-normal"
            part="highlight"
          >
            <LocalizedString
              key="between-quotations"
              params={{text: query}}
              i18n={i18n}
            />
          </span>
        ),
      }}
    />
  ) : (
    i18n.t(i18nKey)
  );
  return (
    <div
      class="my-2 max-w-full text-center text-2xl font-medium"
      part="no-results"
    >
      {content}
    </div>
  );
};
