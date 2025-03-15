import {i18n} from 'i18next';
import {html, nothing} from 'lit';
import {button} from '../button';
import {ItemKind} from './common-types';

type LoadMoreButton = `load-more-${ItemKind}`;

interface LoadMoreButtonProps {
  i18n: i18n;
  onClick: () => void;
  moreAvailable: boolean;
  label: LoadMoreButton;
}

export const loadMoreButton = ({
  i18n,
  onClick,
  moreAvailable,
  label,
}: LoadMoreButtonProps) =>
  !moreAvailable
    ? nothing
    : button({
        style: 'primary',
        part: 'load-more-results-button',
        class: 'my-2 p-3 font-bold',
        onClick,
      })(html`${i18n.t(label)}`);
