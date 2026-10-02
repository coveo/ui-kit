import type {RichText as RichTextValue, RichTextSegment} from '@coveo/thermidor-schema';
import {isNavigable, KnowledgeReference} from './KnowledgeReference.js';

function Segment({segment}: {segment: RichTextSegment}) {
  // A missing, unresolvable or unsafe reference degrades to plain text instead of a broken link.
  if (!segment.reference || !isNavigable(segment.reference)) {
    return <>{segment.value}</>;
  }
  // The annotated text itself is the link.
  return <KnowledgeReference reference={segment.reference}>{segment.value}</KnowledgeReference>;
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
