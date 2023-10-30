import {
  GeneratedAnswerCitation,
  SearchEngine,
  buildInteractiveCitation,
} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {Heading} from '../../../common/heading';
import {LinkWithResultAnalytics} from '../../../common/result-link/result-link';

interface CitationProps {
  engine: SearchEngine;
  citation: GeneratedAnswerCitation;
  index: number;
  stopPropagation?: boolean;
}

export const Citation: FunctionalComponent<CitationProps> = ({
  engine,
  citation,
  index,
  stopPropagation,
}) => {
  const interactiveCitation = buildInteractiveCitation(engine, {
    options: {
      citation,
    },
  });

  const getTruncatedText = () =>
    citation.text &&
    `${citation.text?.trim().slice(0, 200)}${
      citation.text.length > 200 ? '...' : ''
    }`;

  return (
    <li key={citation.id} class="citation-item relative">
      <LinkWithResultAnalytics
        href={citation.clickUri ?? citation.uri}
        title={citation.title}
        part="citation"
        target="_blank"
        rel="noopener"
        className="flex items-center p-1 bg-background btn-outline-primary border rounded-full border-neutral text-on-background"
        onSelect={() => interactiveCitation.select()}
        onBeginDelayedSelect={() => interactiveCitation.beginDelayedSelect()}
        onCancelPendingSelect={() => interactiveCitation.cancelPendingSelect()}
        stopPropagation={stopPropagation}
      >
        <div class="citation-index rounded-full font-medium flex items-center text-bg-primary shrink-0">
          <div class="mx-auto">{index + 1}</div>
        </div>
        <span class="citation-title truncate mx-1">{citation.title}</span>
      </LinkWithResultAnalytics>
      <div
        part="citation-popover"
        class={
          'absolute l-0 rounded-md border border-neutral p-4 shadow bottom-9 z-[9999] bg-background flex flex-col gap-3'
        }
      >
        <div class="truncate text-neutral-dark text-sm">
          {citation.clickUri}
        </div>
        <Heading level={0} class="font-bold text-md">
          {citation.title}
        </Heading>
        <p class="text-on-background text-sm">{getTruncatedText()}</p>
      </div>
    </li>
  );
};
