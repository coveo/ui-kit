import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {LocalizedString} from '../../../utils/jsx-utils';

interface NoItemsProps {
  query: string;
  i18n: i18n;
}
export const NoItems: FunctionalComponent<NoItemsProps> = ({i18n, query}) => {
  const content = query ? (
    <LocalizedString
      i18n={i18n}
      key="no-results-for"
      params={{
        query: (
          <span
            class="inline-block max-w-full truncate whitespace-normal align-bottom font-bold"
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
    i18n.t('no-results')
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
