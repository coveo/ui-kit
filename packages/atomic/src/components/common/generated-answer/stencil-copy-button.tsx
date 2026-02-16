import {FunctionalComponent, h} from '@stencil/core';
import CopyIcon from '../../../images/copy.svg';
import {Button} from '../stencil-button';

interface CopyButtonProps {
  title: string;
  isCopied: boolean;
  error: boolean;
  onClick: () => void;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const CopyButton: FunctionalComponent<CopyButtonProps> = (props) => {
  return (
    <Button
      title={props.title}
      part="copy-button"
      style={'text-transparent'}
      class={`rounded-md p-2 ${props.isCopied ? 'copied' : ''} ${
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
