// following docs https://typedoc.org/guides/development/#plugins
// eslint-disable-next-line n/no-unpublished-import
import {Comment, type Context, type DeclarationReflection} from 'typedoc';

const comments = [
  {
    pattern: /ssr\.ts$/,
    text: '\n\nSee [Implement server-side rendering](https://docs.coveo.com/en/headless/latest/usage/headless-server-side-rendering/headless-implement-ssr).',
  },
  {
    pattern: /commerce.*actions-loader\.ts$/,
    text: '\n\nSee [Dispatch actions](https://docs.coveo.com/en/o6r70022#dispatch-actions).',
  },
  {
    pattern: /actions-loader\.ts$/,
    text: '\n\nSee [Dispatch actions](https://docs.coveo.com/en/headless/latest/usage#dispatch-actions).',
  },
];

// NOTE: cannot be converted into an arrow function `this`
export function insertCustomComments(
  this: undefined,
  _ctx: Context,
  refl: DeclarationReflection
) {
  for (const path of comments) {
    if (refl.sources && path.pattern.test(refl.sources[0].fileName)) {
      refl.comment = refl.comment || new Comment();
      refl.comment.summary.push({
        kind: 'text',
        text: path.text,
      });
      break;
    }
  }
}
