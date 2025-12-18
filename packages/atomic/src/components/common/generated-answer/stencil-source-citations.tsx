import {FunctionalComponent, h} from '@stencil/core';

interface SourceCitationsProps {
  label: string;
  isVisible: boolean;
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const SourceCitations: FunctionalComponent<SourceCitationsProps> = (
  props,
  children
) =>
  props.isVisible ? (
    <div class="source-citations">
      <p part="citations-label" class="text-neutral-dark mb-2 shrink-0">
        {props.label}
      </p>
      <ol class="citations-container flex list-none flex-wrap items-center gap-2">
        {children}
      </ol>
    </div>
  ) : null;
