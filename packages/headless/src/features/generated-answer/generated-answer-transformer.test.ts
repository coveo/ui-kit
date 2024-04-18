import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {unified} from 'unified';
import {
  AnswerTransformer,
  transformMarkdownToHtml,
  transformTextPlain,
} from './generated-answer-transformer';

jest.mock('unified', () => {
  const pipeline: {use: jest.SpyInstance; processSync: jest.SpyInstance} = {
    use: jest.fn().mockReturnThis(),
    processSync: jest.fn(),
  };

  return {
    unified: () => pipeline,
  };
});

jest.mock('remark-parse', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('remark-rehype', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('rehype-sanitize', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('rehype-stringify', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('generated-answer-transformer', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('AnswerTransformer', () => {
    describe('get', () => {
      it('should return the Markdown to HTML transformer when given text/markdown', () => {
        const transformer = AnswerTransformer.get('text/markdown');

        expect(transformer).toBe(transformMarkdownToHtml);
      });

      it('should return the plain text transformer when given text/plain', () => {
        const transformer = AnswerTransformer.get('text/plain');

        expect(transformer).toBe(transformTextPlain);
      });
    });
  });

  describe('transformTextPlain', () => {
    it('should return the same answer and content format', () => {
      const rawAnswer = 'this is an answer';

      const transformed = transformTextPlain(rawAnswer);

      expect(transformed.answer).toBe(rawAnswer);
      expect(transformed.contentFormat).toBe('text/plain');
    });
  });

  describe('transformMarkdownToHtml', () => {
    it('should invoke the right plugins', () => {
      const rawAnswer = 'this is an answer';

      const transformed = transformMarkdownToHtml(rawAnswer);

      expect(transformed.contentFormat).toBe('text/html');

      const pipeline = unified();

      expect(pipeline.use).toHaveBeenCalledWith(remarkParse);
      expect(pipeline.use).toHaveBeenCalledWith(remarkGfm);
      expect(pipeline.use).toHaveBeenCalledWith(remarkRehype);
      expect(pipeline.use).toHaveBeenCalledWith(rehypeSanitize);
      expect(pipeline.use).toHaveBeenCalledWith(rehypeStringify);
      expect(pipeline.processSync).toHaveBeenCalledWith(rawAnswer);
    });
  });
});
