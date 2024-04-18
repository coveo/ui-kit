import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {unified} from 'unified';
import {
  GeneratedContentFormat,
  GeneratedRawContentFormat,
} from './generated-response-format';

export type GeneratedAnswerTransformer = (rawAnswer: string) => {
  answer: string;
  contentFormat: GeneratedContentFormat;
};

export const transformTextPlain: GeneratedAnswerTransformer = (
  rawAnswer: string
) => ({
  answer: rawAnswer,
  contentFormat: 'text/plain',
});

export const transformMarkdownToHtml: GeneratedAnswerTransformer = (
  rawAnswer: string
) => {
  const answer = String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .processSync(rawAnswer)
  );

  return {
    answer,
    contentFormat: 'text/html',
  };
};

const transformers: Record<
  GeneratedRawContentFormat,
  GeneratedAnswerTransformer
> = {
  'text/plain': transformTextPlain,
  'text/markdown': transformMarkdownToHtml,
};

const getAnswerTransformer = (
  rawContentFormat: GeneratedRawContentFormat
): GeneratedAnswerTransformer =>
  transformers[rawContentFormat] ?? transformTextPlain;

export const AnswerTransformer = {
  get: getAnswerTransformer,
};
