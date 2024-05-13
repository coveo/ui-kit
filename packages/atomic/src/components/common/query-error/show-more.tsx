import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../button';
import {QueryErrorLink} from './link';

interface QueryErrorShowMoreProps {
  onShowMore: () => void;
  i18n: i18n;
  link?: typeof QueryErrorLink;
}

export const QueryErrorShowMore: FunctionalComponent<
  QueryErrorShowMoreProps
> = ({i18n, onShowMore, link}) => {
  if (link) {
    return link;
  }
  return (
    <Button
      part="more-info-btn"
      style="primary"
      class="p-3 mt-8"
      onClick={() => {
        onShowMore();
      }}
      text={i18n.t('more-info')}
    ></Button>
  );
};
