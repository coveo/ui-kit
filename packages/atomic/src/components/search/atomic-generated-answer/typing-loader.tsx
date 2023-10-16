import {FunctionalComponent, h} from '@stencil/core';

export const TypingLoader: FunctionalComponent = () => (
  <div class="typing-indicator" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
  </div>
);

/*export const LoadingBlock: FunctionalComponent = ()=> {
  return <div class="w-32 h-32"> YO </div>
}*/
