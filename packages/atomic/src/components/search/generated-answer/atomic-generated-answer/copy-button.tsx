import {FunctionalComponent, h} from '@stencil/core';
import CopyIcon from '../../../../images/copy.svg';
import {Button} from '../../../common/button';

interface CopyButtonProps {
  title: string;
  isCopied: boolean;
  error: boolean;
  onClick: () => void;
}

export const CopyButton: FunctionalComponent<CopyButtonProps> = (props) => {
  return (
    <Button
      title={props.title}
      part="copy-button"
      style={'text-transparent'}
      class={`p-2 rounded-md ${props.isCopied ? 'copied' : ''} ${
        props.error ? 'error' : ''
      }`}
      onClick={props.onClick}
    >
      <div class="icon-container text-neutral-dark">
        <atomic-icon class="w-5" icon={CopyIcon}></atomic-icon>
      </div>
    </Button>
  );
};
