import {FunctionalComponent, h} from '@stencil/core';

interface TypingLoaderProps {
  loadingLabel: string;
}

export const TypingLoader: FunctionalComponent<TypingLoaderProps> = (props) => (
  <div>
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="mx-auto text-center mt-4 text-neutral-dark">
      {props.loadingLabel}
    </div>
  </div>
);
