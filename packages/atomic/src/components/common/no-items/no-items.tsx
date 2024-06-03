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
            class="font-bold truncate inline-block align-bottom max-w-full whitespace-normal"
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
      class="my-2 text-2xl font-medium max-w-full text-center"
      part="no-results"
    >
      {content}
    </div>
  );
};
