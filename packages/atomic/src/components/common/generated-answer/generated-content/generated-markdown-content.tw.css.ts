import {css} from 'lit';

const styles = css`
  @reference '../../../../utils/tailwind.global.tw.css';

  [part='generated-text'] [part='answer-heading-1'] {
    @apply text-2xl;
  }

  [part='generated-text'] [part='answer-heading-2'] {
    @apply text-xl;
  }

  [part='generated-text'] [part='answer-heading-3'],
  [part='generated-text'] [part='answer-heading-4'],
  [part='generated-text'] [part='answer-heading-5'],
  [part='generated-text'] [part='answer-heading-6'] {
    @apply text-lg;
  }

  [part='generated-text'] [part='answer-heading-1'],
  [part='generated-text'] [part='answer-heading-2'],
  [part='generated-text'] [part='answer-heading-3'],
  [part='generated-text'] [part='answer-heading-4'],
  [part='generated-text'] [part='answer-heading-5'],
  [part='generated-text'] [part='answer-heading-6'] {
    @apply mt-4 mb-2 font-bold;
  }

  [part='generated-text'] [part='answer-paragraph'] {
    @apply mb-6;
  }

  [part='generated-text'] [part='answer-list-item'],
  [part='generated-text'] [part='answer-paragraph'],
  [part='generated-text'] [part='answer-quote-block'],
  [part='generated-text'] [part='answer-table-header'],
  [part='generated-text'] [part='answer-table-content'] {
    @apply leading-6;
  }

  [part='generated-text'] [part='answer-strong'] {
    @apply font-bold;
  }

  [part='generated-text'] [part='answer-ordered-list'] {
    @apply mb-2 list-decimal ps-8;
  }

  [part='generated-text'] [part='answer-unordered-list'] {
    @apply mb-2 list-disc ps-8;
  }

  [part='generated-text'] [part='answer-inline-code'] {
    @apply text-inline-code bg-neutral-light border-neutral rounded-sm border border-solid px-1 py-0.5 text-sm;
  }

  [part='generated-text'] [part='answer-code-block'] {
    @apply bg-neutral-light border-neutral text-on-background my-4 max-h-96 overflow-auto rounded-md border border-solid p-2 text-sm;
    scrollbar-color: var(--atomic-neutral);
  }

  [part='generated-text'] [part='answer-quote-block'] {
    @apply mx-16 italic;
  }

  [part='generated-text'] [part='answer-table-container'] {
    @apply border-neutral-dim mb-6 inline-block max-h-96 max-w-full overflow-auto rounded-md border border-solid;
  }

  [part='generated-text']
    [part='answer-table-container']
    [part='answer-table-header'] {
    @apply sticky top-0;
  }

  [part='generated-text'] [part='answer-table'] {
    @apply text-base;
  }

  [part='generated-text']
    [part='answer-table']
    thead
    [part='answer-table-header'] {
    @apply bg-neutral border-b-neutral-dim border-l-neutral-dim p-4 text-left font-bold;
  }

  [part='generated-text']
    [part='answer-table']
    thead
    [part='answer-table-header']:first-of-type {
    border-left: none;
  }

  [part='generated-text'] [part='answer-table'] tbody tr:nth-child(even) {
    @apply bg-neutral-light;
  }

  [part='generated-text']
    [part='answer-table']
    tbody
    tr
    [part='answer-table-content'] {
    @apply border-l-neutral-dim border-b-neutral-dim border p-4;
  }

  [part='generated-text']
    [part='answer-table']
    tbody
    tr
    [part='answer-table-content']:first-of-type {
    border-left: none;
  }

  [part='generated-text']
    [part='answer-table']
    tbody
    tr:last-of-type
    [part='answer-table-content'] {
    border-bottom: unset;
  }
`;

export default styles;
