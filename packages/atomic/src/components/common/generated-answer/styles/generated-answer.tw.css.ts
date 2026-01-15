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

  [part='header-icon'] svg,
  [part='header-icon'] svg * {
    fill: currentColor;
    stroke: currentColor;
  }

  /* Generating label visibility */
  .generating-label-visible [part='is-generating'] {
    @apply flex;
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
`;

export default [
  baseStyle,
  generatedText,
  generatedMarkdownContent,
  feedbackButtons,
  copyButton,
];
