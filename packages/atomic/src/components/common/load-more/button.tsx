import {FunctionalComponent, h} from '@stencil/core';
import {i18n} from 'i18next';
import {Button} from '../button';

interface LoadMoreButtonProps {
  i18n: i18n;
  onClick: () => void;
  moreAvailable: boolean;
  label?: 'load-more-results' | 'load-more-products';
}

export const LoadMoreButton: FunctionalComponent<LoadMoreButtonProps> = ({
  i18n,
  onClick,
  moreAvailable,
  label,
}) => {
  if (!moreAvailable) {
    return;
  }
  return (
    <Button
      style="primary"
      text={i18n.t(label || 'load-more-results')}
      part="load-more-results-button"
      class="my-2 p-3 font-bold"
      onClick={() => onClick()}
    ></Button>
  );
};
