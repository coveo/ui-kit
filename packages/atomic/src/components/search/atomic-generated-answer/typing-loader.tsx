import {FunctionalComponent, h} from '@stencil/core';

export const TypingLoader: FunctionalComponent = () => (
  <div part="container-background" class="typing-indicator" aria-hidden="true">
    <span part="container-dot"></span>
    <span part="container-dot"></span>
    <span part="container-dot"></span>
  </div>
);
