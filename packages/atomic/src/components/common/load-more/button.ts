import type {i18n} from 'i18next';
import {html, nothing} from 'lit';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {renderButton} from '../button';

interface LoadMoreButtonProps {
  i18n: i18n;
  onClick: () => void;
  moreAvailable: boolean;
  label: 'load-more-results' | 'load-more-products';
}

export const renderLoadMoreButton: FunctionalComponent<LoadMoreButtonProps> = ({
  props,
}) => {
  const {i18n, onClick, moreAvailable, label} = props;

  if (!moreAvailable) {
    return nothing;
  }

  return renderButton({
    props: {
      style: 'primary',
      part: 'load-more-results-button',
      class: 'my-2 p-3 font-bold',
      onClick: () => onClick(),
    },
  })(html`${i18n.t(label)}`);
};
