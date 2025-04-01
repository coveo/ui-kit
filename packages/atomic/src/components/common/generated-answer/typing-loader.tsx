import {FunctionalComponent, h} from '@stencil/core';

export const TypingLoader: FunctionalComponent = () => (
  <div class="typing-indicator" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
  </div>
);
