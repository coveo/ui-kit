import {i18n} from 'i18next';
import {button, ButtonProps} from '../button';

interface LoadMoreButtonProps {
  i18n: i18n;
  onClick: () => void;
  moreAvailable: boolean;
  label?: 'load-more-results' | 'load-more-products';
}

export function loadMoreButton({
  i18n,
  onClick,
  moreAvailable,
  label,
}: LoadMoreButtonProps) {
  if (!moreAvailable) {
    return;
  }
  const props: ButtonProps = {
    style: 'primary',
    part: 'load-more-results-button',
    class: 'my-2 p-3 font-bold',
    onClick: () => onClick(),
  };
  return button({props, children: i18n.t(label || 'load-more-results')});
}
