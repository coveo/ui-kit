import {html, nothing} from 'lit';
import type {FunctionalComponentWithChildren} from '@/src/utils/functional-component-utils';

export interface SourceCitationsProps {
  label: string;
  isVisible: boolean;
}

export const renderSourceCitations: FunctionalComponentWithChildren<
  SourceCitationsProps
> = ({props}) => {
  return (children) =>
    props.isVisible
      ? html`
          <div class="source-citations">
            <p part="citations-label" class="text-neutral-dark mb-2 shrink-0">
              ${props.label}
            </p>
            <ol
              class="citations-container flex list-none flex-wrap items-center gap-2"
            >
              ${children}
            </ol>
          </div>
        `
      : nothing;
};
