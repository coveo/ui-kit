import type {Reference} from '@coveo/thermidor-schema';
import type {ReactNode} from 'react';

/**
 * Whether the reference can be safely navigated to. Renderers navigate only via the resolved
 * `clickUri`, and only to http(s) destinations.
 */
export function isNavigable(reference: Reference): boolean {
  try {
    const {protocol} = new URL(reference.clickUri);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

interface KnowledgeReferenceProps {
  reference: Reference;
  /** The annotated text. */
  children: ReactNode;
}

/** A link to the document behind a knowledge reference, navigating only via its `clickUri`. */
export function KnowledgeReference({reference, children}: KnowledgeReferenceProps) {
  return (
    <a href={reference.clickUri} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
