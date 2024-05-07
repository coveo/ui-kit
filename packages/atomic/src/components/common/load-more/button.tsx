import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../button';

interface LoadMoreButtonProps {
  i18n: i18n;
  onClick: () => void;
  moreAvailable: boolean;
}

export const LoadMoreButton: FunctionalComponent<LoadMoreButtonProps> = ({
  i18n,
  onClick,
  moreAvailable,
}) => {
  if (!moreAvailable) {
    return;
  }
  return (
    <Button
      style="primary"
      text={i18n.t('load-more-results')}
      part="load-more-results-button"
      class="font-bold my-2 p-3"
      onClick={() => onClick()}
    ></Button>
  );
};
