import {FunctionalComponent, h} from '@stencil/core';

export const TypingLoader: FunctionalComponent = () => (
  <div part="typing-animation" class="typing-indicator" aria-hidden="true">
    <span part="typing-animation-dot"></span>
    <span part="typing-animation-dot"></span>
    <span part="typing-animation-dot"></span>
  </div>
);
