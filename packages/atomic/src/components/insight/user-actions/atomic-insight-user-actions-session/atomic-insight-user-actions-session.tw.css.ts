import {css} from 'lit';

export default css`
  @reference '../../../../utils/coveo.tw.css';

  .session-start-icon__container {
    background-color: #fbb439;
  }

  .user-action__separator {
    @apply bg-neutral;
  }

  .ticket-creation-action__text {
    @apply text-success;
  }

  .text-xxs {
    font-size: 0.625rem;
  }
`;
