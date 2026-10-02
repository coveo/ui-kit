import type {RichText as RichTextValue, RichTextSegment} from '@coveo/thermidor-schema';
import {isNavigable, KnowledgeReference} from './KnowledgeReference.js';
import styles from './RichText.module.css';

function Segment({segment}: {segment: RichTextSegment}) {
  // Unresolvable or unsafe references degrade to plain text instead of a broken link.
  const references = (segment.references ?? []).filter(isNavigable);

  if (references.length === 0) {
    return <>{segment.value}</>;
  }
  // One reference: the text itself is the link.
  if (references.length === 1) {
    return <KnowledgeReference reference={references[0]!}>{segment.value}</KnowledgeReference>;
  }
  // Several references: the text stays plain, followed by one numbered badge per reference.
  return (
    <>
      {segment.value}
      <sup className={styles.badges}>
        {references.map((reference, index) => (
          <KnowledgeReference key={reference.permanentId} reference={reference} variant="badge">
            {index + 1}
          </KnowledgeReference>
        ))}
      </sup>
    </>
  );
}

/** Renders a plain string, or a RichText value with its (possibly referenced) segments. */
export function RichText({value}: {value: string | RichTextValue}) {
  if (typeof value === 'string') {
    return <>{value}</>;
  }
  return (
    <>
      {value.content.map((segment, index) => (
        <Segment key={index} segment={segment} />
      ))}
    </>
  );
}
