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
    <div class="source-citations gap-2 mt-6 flex">
      <p
        part="citations-label"
        class="py-1 text-neutral-dark shrink-0 flex flex-col justify-center"
      >
        {props.label}
      </p>
      <ol class="list-none citations-container gap-2 flex items-center flex-wrap">
        {children}
      </ol>
    </div>
  ) : null;
