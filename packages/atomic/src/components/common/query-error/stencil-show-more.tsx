import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../stencil-button';
import {QueryErrorLink} from './stencil-link';

interface QueryErrorShowMoreProps {
  onShowMore: () => void;
  i18n: i18n;
  link?: typeof QueryErrorLink;
}

/**
 * @deprecated should only be used for Stencil components.
 */
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
      class="mt-8 p-3"
      onClick={() => {
        onShowMore();
      }}
      text={i18n.t('more-info')}
    ></Button>
  );
};
