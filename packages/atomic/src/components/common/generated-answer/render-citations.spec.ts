import type {
  GeneratedAnswerCitation,
  InteractiveCitation,
} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {type RenderCitationsProps, renderCitations} from './render-citations';

describe('#renderCitations', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const createMockCitation = (
    id: string,
    title?: string
  ): GeneratedAnswerCitation => ({
    id,
    title: title || `Citation ${id}`,
    uri: `https://example.com/${id}`,
    permanentid: id,
    clickUri: `https://example.com/${id}`,
    text: `Citation text ${id}`,
  });

  const createMockInteractiveCitation = (): InteractiveCitation =>
    ({
      select: vi.fn(),
      beginDelayedSelect: vi.fn(),
      cancelPendingSelect: vi.fn(),
      // biome-ignore lint/suspicious/noExplicitAny: Test fixture with partial mock
    }) as any;

  const renderComponent = async (
    overrides: Partial<RenderCitationsProps> = {}
  ) => {
    const defaultProps: RenderCitationsProps = {
      citations: [createMockCitation('1'), createMockCitation('2')],
      i18n,
      buildInteractiveCitation: vi
        .fn()
        .mockReturnValue(createMockInteractiveCitation()),
      logCitationHover: vi.fn(),
      disableCitationAnchoring: false,
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderCitations({props: defaultProps})}`
    );

    return {
      element,
      citations: Array.from(element.querySelectorAll('atomic-citation')),
      listItems: Array.from(element.querySelectorAll('li')),
    };
  };

  it('should render empty when citations is undefined', async () => {
    const {element} = await renderComponent({citations: undefined});

    expect(element.children.length).toBe(0);
  });

  it('should render empty when citations is an empty array', async () => {
    const {element} = await renderComponent({citations: []});

    expect(element.children.length).toBe(0);
  });

  it('should render all citations', async () => {
    const {citations} = await renderComponent();

    expect(citations).toHaveLength(2);
  });

  it('should render each citation in a list item', async () => {
    const {listItems} = await renderComponent();

    expect(listItems).toHaveLength(2);
    listItems.forEach((item) => {
      expect(item.tagName).toBe('LI');
    });
  });

  it('should pass citation data to atomic-citation', async () => {
    const mockCitations = [
      createMockCitation('test-1', 'Test Title 1'),
      createMockCitation('test-2', 'Test Title 2'),
    ];

    const {citations} = await renderComponent({citations: mockCitations});

    expect(citations[0]).toHaveProperty('citation');
    expect(citations[1]).toHaveProperty('citation');
  });

  it('should pass the correct index to each citation', async () => {
    const {citations} = await renderComponent();

    expect(citations[0]).toHaveProperty('index', 0);
    expect(citations[1]).toHaveProperty('index', 1);
  });

  it('should build interactive citation for each citation', async () => {
    const buildInteractiveCitation = vi
      .fn()
      .mockReturnValue(createMockInteractiveCitation());
    const mockCitations = [createMockCitation('1'), createMockCitation('2')];

    await renderComponent({
      citations: mockCitations,
      buildInteractiveCitation,
    });

    expect(buildInteractiveCitation).toHaveBeenCalledTimes(2);
    expect(buildInteractiveCitation).toHaveBeenCalledWith(mockCitations[0]);
    expect(buildInteractiveCitation).toHaveBeenCalledWith(mockCitations[1]);
  });

  it('should pass interactive citation to atomic-citation', async () => {
    const mockInteractiveCitation = createMockInteractiveCitation();
    const buildInteractiveCitation = vi
      .fn()
      .mockReturnValue(mockInteractiveCitation);

    const {citations} = await renderComponent({buildInteractiveCitation});

    expect(citations[0]).toHaveProperty('interactiveCitation');
    expect(citations[1]).toHaveProperty('interactiveCitation');
  });

  it('should pass sendHoverEndEvent callback to atomic-citation', async () => {
    const logCitationHover = vi.fn();
    const mockCitations = [createMockCitation('test-id')];

    const {citations} = await renderComponent({
      citations: mockCitations,
      logCitationHover,
    });

    // biome-ignore lint/suspicious/noExplicitAny: Test requires accessing element properties
    const citation = citations[0] as any;
    expect(citation.sendHoverEndEvent).toBeDefined();

    // Call the sendHoverEndEvent to verify it calls logCitationHover
    citation.sendHoverEndEvent(100);
    expect(logCitationHover).toHaveBeenCalledWith('test-id', 100);
  });

  it('should pass disableCitationAnchoring prop to atomic-citation', async () => {
    const {citations} = await renderComponent({
      disableCitationAnchoring: true,
    });

    expect(citations[0]).toHaveProperty('disableCitationAnchoring', true);
    expect(citations[1]).toHaveProperty('disableCitationAnchoring', true);
  });

  it('should not disable citation anchoring by default', async () => {
    const {citations} = await renderComponent();

    expect(citations[0]).toHaveProperty('disableCitationAnchoring', false);
    expect(citations[1]).toHaveProperty('disableCitationAnchoring', false);
  });

  it('should export citation and citation-popover parts', async () => {
    const {citations} = await renderComponent();

    citations.forEach((citation) => {
      expect(citation).toHaveAttribute(
        'exportparts',
        'citation,citation-popover'
      );
    });
  });

  it('should use keyed directive for citation rendering', async () => {
    const mockCitations = [
      createMockCitation('unique-1'),
      createMockCitation('unique-2'),
    ];

    const {citations} = await renderComponent({citations: mockCitations});

    // The keyed directive ensures each citation is uniquely identified by its id
    expect(citations).toHaveLength(2);
  });

  it('should add max-w-full class to list items', async () => {
    const {listItems} = await renderComponent();

    listItems.forEach((item) => {
      expect(item).toHaveClass('max-w-full');
    });
  });

  it('should handle citations without titles', async () => {
    const mockCitations = [
      {
        id: 'no-title',
        uri: 'https://example.com',
        permanentid: 'no-title',
        clickUri: 'https://example.com',
        text: 'No title citation',
      } as GeneratedAnswerCitation,
    ];

    const {citations} = await renderComponent({citations: mockCitations});

    expect(citations).toHaveLength(1);
    expect(citations[0]).toHaveProperty('citation');
  });
});
