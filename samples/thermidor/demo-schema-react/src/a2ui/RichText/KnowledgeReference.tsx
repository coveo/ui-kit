import type {Reference} from '@coveo/thermidor-schema';
import type {ReactNode} from 'react';
import styles from './RichText.module.css';

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
  /** The link content: the annotated text, or a badge label. */
  children: ReactNode;
  variant?: 'text' | 'badge';
}

/** A link to the document behind a knowledge reference, navigating only via its `clickUri`. */
export function KnowledgeReference({
  reference,
  children,
  variant = 'text',
}: KnowledgeReferenceProps) {
  return (
    <a
      className={variant === 'badge' ? styles.badge : undefined}
      href={reference.clickUri}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={variant === 'badge' ? reference.title : undefined}
    >
      {children}
    </a>
  );
}
