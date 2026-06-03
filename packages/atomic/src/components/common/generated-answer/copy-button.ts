import {html} from 'lit';
import {renderButton} from '@/src/components/common/button';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import CopyIcon from '../../../images/copy.svg';
import '@/src/components/common/atomic-icon/atomic-icon';

export interface CopyButtonProps {
  title: string;
  isCopied: boolean;
  error: boolean;
  onClick: () => void;
}

export const renderCopyButton: FunctionalComponent<CopyButtonProps> = ({
  props,
}) => {
  const classes = ['rounded-md', 'p-2'];
  if (props.isCopied) {
    classes.push('copied');
  }
  if (props.error) {
    classes.push('error');
  }

  return renderButton({
    props: {
      title: props.title,
      part: 'copy-button',
      style: 'text-transparent',
      class: classes.join(' '),
      onClick: props.onClick,
    },
  })(html`
    <div class="icon-container text-neutral-dark">
      <atomic-icon class="w-5" .icon=${CopyIcon}></atomic-icon>
    </div>
  `);
};
