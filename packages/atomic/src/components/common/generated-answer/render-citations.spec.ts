import type {GeneratedAnswerCitation} from '@coveo/headless';
import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {type RenderCitationsProps, renderCitations} from './render-citations';

vi.mock('./generated-answer-utils', () => ({
  getCitationWithTitle: vi.fn((citation) => citation),
}));

describe('#renderCitations', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockCitation = (
    id: string,
    title?: string
  ): GeneratedAnswerCitation =>
    ({
      id,
      title: title || `Citation ${id}`,
      uri: `https://example.com/${id}`,
      permanentid: id,
      clickUri: `https://example.com/${id}`,
      text: `Citation text ${id}`,
      // biome-ignore lint/suspicious/noExplicitAny: Test fixture with partial mock
    }) as any;

  const renderComponent = async (
    overrides: Partial<RenderCitationsProps> = {}
  ) => {
    const defaultProps: RenderCitationsProps = {
      citations: [createMockCitation('1'), createMockCitation('2')],
      i18n,
      buildInteractiveCitation: vi.fn(),
      logCitationHover: vi.fn(),
      disableCitationAnchoring: false,
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderCitations({props: defaultProps})}`
    );

    return {
      element,
      props: defaultProps,
    };
  };

  it('should return empty when citations is undefined', async () => {
    const {element} = await renderComponent({citations: undefined});

    expect(element.children.length).toBe(0);
  });

  it('should return empty when citations is an empty array', async () => {
    const {element} = await renderComponent({citations: []});

    expect(element.children.length).toBe(0);
  });

  it('should call getCitationWithTitle for each citation', async () => {
    const {getCitationWithTitle} = await import('./generated-answer-utils');
    const mockCitations = [createMockCitation('1'), createMockCitation('2')];

    await renderComponent({citations: mockCitations});

    expect(getCitationWithTitle).toHaveBeenCalledTimes(2);
    expect(getCitationWithTitle).toHaveBeenCalledWith(mockCitations[0], i18n);
    expect(getCitationWithTitle).toHaveBeenCalledWith(mockCitations[1], i18n);
  });

  it('should call buildInteractiveCitation for each citation', async () => {
    const buildInteractiveCitation = vi.fn();
    const mockCitations = [createMockCitation('1'), createMockCitation('2')];

    await renderComponent({
      citations: mockCitations,
      buildInteractiveCitation,
    });

    expect(buildInteractiveCitation).toHaveBeenCalledTimes(2);
    expect(buildInteractiveCitation).toHaveBeenCalledWith(mockCitations[0]);
    expect(buildInteractiveCitation).toHaveBeenCalledWith(mockCitations[1]);
  });

  it('should create callback that calls logCitationHover with citation id and time', async () => {
    const logCitationHover = vi.fn();
    const mockCitations = [createMockCitation('test-id')];

    const {element} = await renderComponent({
      citations: mockCitations,
      logCitationHover,
    });

    const citation = element.querySelector('atomic-citation');
    const sendHoverEndEvent = citation?.sendHoverEndEvent!;

    expect(sendHoverEndEvent).toBeDefined();
    sendHoverEndEvent(100);
    expect(logCitationHover).toHaveBeenCalledWith('test-id', 100);
  });

  it('should render list items', async () => {
    const {element} = await renderComponent();

    const listItems = Array.from(element.querySelectorAll('li'));
    expect(listItems).toHaveLength(2);
  });

  it('should render atomic-citation elements with exportparts', async () => {
    const {element} = await renderComponent();

    const citations = Array.from(element.querySelectorAll('atomic-citation'));
    expect(citations).toHaveLength(2);
    citations.forEach((citation) => {
      expect(citation).toHaveAttribute(
        'exportparts',
        'citation,citation-popover'
      );
    });
  });
});
