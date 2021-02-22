import {createMockState} from '../../test';
import {buildMockResult} from '../../test';
import {partialDocumentInformation} from './analytics-utils';

describe('analytics-utils', () => {
  it('should extract documentation information with a single author', () => {
    const result = buildMockResult();
    result.raw['author'] = 'john';

    expect(
      partialDocumentInformation(result, createMockState()).documentAuthor
    ).toBe('john');
  });

  it('should extract documentation information with multiple author', () => {
    const result = buildMockResult();
    result.raw['author'] = ['john', 'doe'];

    expect(
      partialDocumentInformation(result, createMockState()).documentAuthor
    ).toBe('john;doe');
  });

  it('should extract document information when there is no author', () => {
    const result = buildMockResult();
    delete result.raw['author'];
    expect(
      partialDocumentInformation(result, createMockState()).documentAuthor
    ).toBe('unknown');
  });
});
