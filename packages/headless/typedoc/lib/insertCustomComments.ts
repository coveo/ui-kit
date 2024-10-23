// following docs https://typedoc.org/guides/development/#plugins
// eslint-disable-next-line n/no-unpublished-import
import {Context, Comment, DeclarationReflection} from 'typedoc';

const comments = [
  {
    file: 'ssr.ts',
    text: '\n\nSee [Implement server-side rendering](https://docs.coveo.com/en/headless/latest/usage/headless-server-side-rendering/headless-implement-ssr).',
  },
];

export function insertCustomComments(
  this: undefined,
  _ctx: Context,
  refl: DeclarationReflection
) {
  for (const path of comments) {
    if (refl.sources && refl.sources[0].fileName.endsWith(path.file)) {
      refl.comment = refl.comment || new Comment();
      refl.comment.summary.push({
        kind: 'text',
        text: path.text,
      });
    }
  }
}
