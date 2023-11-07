import {FunctionalComponent, h} from '@stencil/core';

interface SourceCitationsProps {
  label: string;
  isVisible: boolean;
}

export const SourceCitations: FunctionalComponent<SourceCitationsProps> = (
  props,
  children
) =>
  props.isVisible ? (
    <div class="source-citations">
      <p part="citations-label" class="mb-2 text-neutral-dark shrink-0">
        {props.label}
      </p>
      <ol class="list-none citations-container gap-2 flex items-center flex-wrap">
        {children}
      </ol>
    </div>
  ) : null;
