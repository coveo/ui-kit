import type {Reference, RichText as RichTextValue} from '@coveo/thermidor-schema';
import {Lexer, type Token} from 'marked';
import type {ReactNode} from 'react';
import {isNavigable, KnowledgeReference} from './KnowledgeReference.js';

const CITATION_SCHEME = 'ref:';

/**
 * Walks the inline tokens of the Markdown. Only the citation link `[text](ref:<permanentId>)` is
 * interpreted; every other token is shown as the plain text the producer wrote.
 */
function renderTokens(tokens: Token[], references: Map<string, Reference>): ReactNode[] {
  return tokens.map((token, index) => {
    if (token.type === 'link' && 'tokens' in token && Array.isArray(token.tokens)) {
      const children = renderTokens(token.tokens, references);
      const reference = token.href.startsWith(CITATION_SCHEME)
        ? references.get(token.href.slice(CITATION_SCHEME.length))
        : undefined;
      // An unresolved or unsafe citation degrades to its plain text instead of a broken link.
      if (!reference || !isNavigable(reference)) {
        return <span key={index}>{children}</span>;
      }
      return (
        <KnowledgeReference key={index} reference={reference}>
          {children}
        </KnowledgeReference>
      );
    }
    // `text` tokens are HTML-escaped by marked, so show the source text instead. `escape` tokens
    // (`\[`) already carry the unescaped character.
    return token.type === 'escape' ? token.text : token.raw;
  });
}

/** Renders a plain string, or a Markdown RichText value with its citation links. */
export function RichText({value}: {value: string | RichTextValue}) {
  if (typeof value === 'string') {
    return <>{value}</>;
  }
  const references = new Map((value.references ?? []).map((ref) => [ref.permanentId, ref]));
  // GFM is off so bare URLs in the text are not turned into links: only citations are.
  const tokens = Lexer.lexInline(value.markdown, {gfm: false});
  return <>{renderTokens(tokens, references)}</>;
}
