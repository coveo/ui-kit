import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {i18n} from 'i18next';
import {html} from 'lit';
import {button, ButtonProps} from '../button';

interface LoadMoreButtonProps {
  i18n: i18n;
  onClick: () => void;
  moreAvailable: boolean;
  label: 'load-more-results' | 'load-more-products';
}

export const loadMoreButton: FunctionalComponent<LoadMoreButtonProps> = ({
  props,
}) => {
  const {i18n, onClick, moreAvailable, label} = props;
  if (!moreAvailable) {
    return;
  }
  const buttonProps: ButtonProps = {
    style: 'primary',
    part: 'load-more-results-button',
    class: 'my-2 p-3 font-bold',
    onClick: () => onClick(),
  };
  return button({
    props: buttonProps,
    children: html`${i18n.t(label)}`,
  });
};
