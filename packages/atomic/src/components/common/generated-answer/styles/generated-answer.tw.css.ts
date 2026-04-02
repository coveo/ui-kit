import {css} from 'lit';
import generatedMarkdownContent from '../generated-content/generated-markdown-content.tw.css';
import copyButton from './copy-button.tw.css';
import feedbackButtons from './feedback-buttons.tw.css';
import generatedText from './generated-text.tw.css';

const baseStyle = css`
  @reference '../../../../utils/tailwind.global.tw.css';

  /* Cursor blink animation */
  @keyframes cursor-blink {
    0% {
      opacity: 0;
    }
  }

  @keyframes generation-steps-rolodex {
    0% {
      transform: translateY(105%) rotateX(-82deg);
      opacity: 0.75;
    }

    100% {
      transform: translateY(0) rotateX(0deg);
      opacity: 1;
    }
  }

  /* Container part styles */
  [part='container'] {
    container-type: inline-size;
    contain: layout;
  }

  /* Footer styles - responsive layout via container queries and media queries */
  .footer {
    @apply flex;
  }

  .footer .source-citations {
    @apply mr-2;
  }

  @container (max-width: 37.5rem) {
    .footer {
      @apply flex-col gap-4;
    }
    .footer .source-citations {
      @apply mr-0;
    }
    [part='generated-answer-footer'] {
      @apply flex-col gap-1;
    }
  }

  @media not all and (width >= 768px) {
    .footer {
      @apply flex-col gap-4;
    }
    .footer .source-citations {
      @apply mr-0;
    }
    [part='generated-answer-footer'] {
      @apply flex-col gap-1;
    }
  }

  @container (max-width: 25rem) {
    .footer {
      @apply mt-4;
    }
    .footer .feedback-buttons {
      @apply relative top-0 right-0;
    }
  }

  /* Collapsible footer styles */
  .is-collapsible {
    @apply justify-between;
  }

  .is-collapsible [part='answer-show-button'] {
    @apply flex;
  }

  /* Ensure header icon inherits and applies the primary text color */
  [part='header-icon'] {
    color: var(--atomic-primary);
  }

  /* Reserve space so the query text doesn't reflow when action buttons appear */
  [part='feedback-and-copy-buttons'] {
    min-width: var(--atomic-generated-answer-actions-reserved-width, 8rem);
  }

  [part='header-icon'] svg,
  [part='header-icon'] svg * {
    fill: currentColor;
    stroke: currentColor;
  }

  /* Generating label visibility */
  .generating-label-visible [part='is-generating'] {
    @apply flex;
  }

  [part='agent-generation-status'] .generation-steps-container {
    @apply inline-flex overflow-hidden;
    perspective: 700px;
  }

  [part='agent-generation-status'] .generation-steps-value {
    @apply inline-block whitespace-nowrap;
    transform-origin: 50% 100%;
    animation: generation-steps-rolodex 1000ms cubic-bezier(0.22, 0.9, 0.26, 1)
      both;
    will-change: transform;
    backface-visibility: hidden;
  }

  /* Collapsed answer container styles */
  [part='generated-container'].answer-collapsed {
    @apply relative overflow-hidden;
    max-height: var(--atomic-crga-collapsed-height, 16rem);
  }

  [part='generated-container'].answer-collapsed::before {
    content: '';
    @apply absolute top-0 left-0 h-full w-full;
    background: linear-gradient(
      transparent calc(var(--atomic-crga-collapsed-height, 16rem) * 0.7),
      var(--atomic-background)
    );
  }

  [part='generated-container'].answer-collapsed .feedback-buttons {
    @apply hidden;
  }

  /**
   * @prop --atomic-generated-answer-content-fixed-height: The fixed height of the generated answer content when agent-id is set.
   */
  [part='generated-content-container'] .agent-scrollable {
    @apply overflow-y-auto;
    height: var(--atomic-generated-answer-content-fixed-height, 50vh);
  }

  /* Allow query label up to 3 lines before truncating */
  .query-text {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default [
  baseStyle,
  generatedText,
  generatedMarkdownContent,
  feedbackButtons,
  copyButton,
];
