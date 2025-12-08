import {css} from 'lit';

const styles = css`
  /* Feedback button styles */
  .feedback-buttons [part='feedback-button'] {
    width: 2.2rem;
    height: 2.2rem;
    @apply text-neutral-dark;
  }

  .feedback-buttons [part='feedback-button'].dislike {
    rotate: 180deg;
  }

  .feedback-buttons [part='feedback-button']:hover.like,
  .feedback-buttons [part='feedback-button'].active.like {
    @apply text-success;
  }

  .feedback-buttons [part='feedback-button']:hover.dislike,
  .feedback-buttons [part='feedback-button'].active.dislike {
    @apply text-error;
  }
`;

export default styles;
