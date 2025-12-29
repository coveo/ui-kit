import {
  buildSmartSnippet,
  buildTabManager,
  type InlineLink,
  type SmartSnippet,
  type TabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSmartSnippet} from '@/vitest-utils/testing-helpers/fixtures/headless/search/smart-snippet-controller';
import {buildFakeTabManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/tab-manager-controller';
import type {AtomicSmartSnippet} from './atomic-smart-snippet';
import './atomic-smart-snippet';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-smart-snippet', () => {
  let mockedSmartSnippet: SmartSnippet;
  let mockedTabManager: TabManager;

  beforeEach(() => {
    mockedSmartSnippet = buildFakeSmartSnippet({
      state: {
        answerFound: true,
        question: 'What is the meaning of life?',
        answer: '<p>The answer is <b>42</b>.</p>',
        source: {
          title: "The Hitchhiker's Guide to the Galaxy",
          clickUri: 'https://example.com/guide',
          uniqueId: 'guide-123',
          raw: {},
        } as unknown as NonNullable<
          ReturnType<typeof buildFakeSmartSnippet>['state']['source']
        >,
        liked: false,
        disliked: false,
        expanded: false,
      },
    });
    mockedTabManager = buildFakeTabManager({});
  });

  const renderAtomicSmartSnippet = async ({
    props = {},
  }: {
    props?: Partial<{
      headingLevel: number;
      maximumHeight: number;
      collapsedHeight: number;
      snippetStyle: string;
      tabsIncluded: string[];
      tabsExcluded: string[];
      snippetMaximumHeight: number;
      snippetCollapsedHeight: number;
    }>;
  } = {}) => {
    vi.mocked(buildSmartSnippet).mockReturnValue(mockedSmartSnippet);
    vi.mocked(buildTabManager).mockReturnValue(mockedTabManager);

    const {element} = await renderInAtomicSearchInterface<AtomicSmartSnippet>({
      template: html`<atomic-smart-snippet
        .headingLevel=${props.headingLevel ?? 0}
        .maximumHeight=${props.maximumHeight ?? 250}
        .collapsedHeight=${props.collapsedHeight ?? 180}
        .snippetStyle=${props.snippetStyle}
        .tabsIncluded=${props.tabsIncluded ?? []}
        .tabsExcluded=${props.tabsExcluded ?? []}
        .snippetMaximumHeight=${props.snippetMaximumHeight}
        .snippetCollapsedHeight=${props.snippetCollapsedHeight}
      ></atomic-smart-snippet>`,
      selector: 'atomic-smart-snippet',
    });

    const parts = (el: AtomicSmartSnippet) => ({
      smartSnippet: el.shadowRoot?.querySelector('[part~="smart-snippet"]'),
      question: el.shadowRoot?.querySelector('[part~="question"]'),
      answer: el.shadowRoot?.querySelector('[part~="answer"]'),
      truncatedAnswer: el.shadowRoot?.querySelector(
        '[part~="truncated-answer"]'
      ),
      body: el.shadowRoot?.querySelector('[part~="body"]'),
      footer: el.shadowRoot?.querySelector('[part~="footer"]'),
      feedbackBanner: el.shadowRoot?.querySelector('[part~="feedback-banner"]'),
      feedbackLikeButton: el.shadowRoot?.querySelector(
        '[part~="feedback-like-button"]'
      ),
      feedbackDislikeButton: el.shadowRoot?.querySelector(
        '[part~="feedback-dislike-button"]'
      ),
    });

    return {element, parts};
  };

  describe('when controller is initialized', () => {
    it('should call buildSmartSnippet with the engine', async () => {
      const {element} = await renderAtomicSmartSnippet();
      expect(buildSmartSnippet).toHaveBeenCalledWith(element.bindings.engine);
    });

    it('should call buildTabManager with the engine', async () => {
      const {element} = await renderAtomicSmartSnippet();
      expect(buildTabManager).toHaveBeenCalledWith(element.bindings.engine);
    });
  });

  describe('when answer is found', () => {
    beforeEach(() => {
      mockedSmartSnippet.state.answerFound = true;
    });

    it('should render the smart snippet', async () => {
      const {element, parts} = await renderAtomicSmartSnippet();
      await expect.element(parts(element).smartSnippet!).toBeInTheDocument();
    });

    it('should render the question', async () => {
      const {element, parts} = await renderAtomicSmartSnippet();
      const question = parts(element).question!;
      await expect.element(question).toBeInTheDocument();
      expect(question.textContent?.trim()).toBe(
        mockedSmartSnippet.state.question
      );
    });

    it('should render the expandable answer when snippetMaximumHeight is undefined', async () => {
      const {element} = await renderAtomicSmartSnippet({
        props: {snippetMaximumHeight: undefined},
      });
      const expandableAnswer = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-expandable-answer'
      );
      await expect.element(expandableAnswer!).toBeInTheDocument();
    });

    it('should render the truncated answer when snippetMaximumHeight is defined', async () => {
      const {element, parts} = await renderAtomicSmartSnippet({
        props: {snippetMaximumHeight: 200},
      });
      await expect.element(parts(element).truncatedAnswer!).toBeInTheDocument();
    });

    it('should render the footer', async () => {
      const {element, parts} = await renderAtomicSmartSnippet();
      await expect.element(parts(element).footer!).toBeInTheDocument();
    });

    it('should render the source when source is present', async () => {
      const {element} = await renderAtomicSmartSnippet();
      const source = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-source'
      );
      await expect.element(source!).toBeInTheDocument();
    });

    it('should render the feedback banner', async () => {
      const {element, parts} = await renderAtomicSmartSnippet();
      await expect.element(parts(element).feedbackBanner!).toBeInTheDocument();
    });
  });

  describe('when answer is not found', () => {
    beforeEach(() => {
      mockedSmartSnippet.state.answerFound = false;
    });

    it('should not render the smart snippet', async () => {
      const {element, parts} = await renderAtomicSmartSnippet();
      await expect
        .element(parts(element).smartSnippet!)
        .not.toBeInTheDocument();
    });
  });

  describe('when source is not present', () => {
    beforeEach(() => {
      mockedSmartSnippet.state.source = null;
    });

    it('should not render the source', async () => {
      const {element} = await renderAtomicSmartSnippet();
      const source = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-source'
      );
      expect(source).toBeNull();
    });
  });

  describe('tab filtering', () => {
    describe('when tabsIncluded is set', () => {
      it('should render when current tab is included', async () => {
        mockedTabManager.state.activeTab = 'tab1';
        const {element, parts} = await renderAtomicSmartSnippet({
          props: {tabsIncluded: ['tab1', 'tab2']},
        });
        await expect.element(parts(element).smartSnippet!).toBeInTheDocument();
      });

      it('should not render when current tab is not included', async () => {
        mockedTabManager.state.activeTab = 'tab3';
        const {element, parts} = await renderAtomicSmartSnippet({
          props: {tabsIncluded: ['tab1', 'tab2']},
        });
        await expect
          .element(parts(element).smartSnippet!)
          .not.toBeInTheDocument();
      });
    });

    describe('when tabsExcluded is set', () => {
      it('should not render when current tab is excluded', async () => {
        mockedTabManager.state.activeTab = 'tab1';
        const {element, parts} = await renderAtomicSmartSnippet({
          props: {tabsExcluded: ['tab1', 'tab2']},
        });
        await expect
          .element(parts(element).smartSnippet!)
          .not.toBeInTheDocument();
      });

      it('should render when current tab is not excluded', async () => {
        mockedTabManager.state.activeTab = 'tab3';
        const {element, parts} = await renderAtomicSmartSnippet({
          props: {tabsExcluded: ['tab1', 'tab2']},
        });
        await expect.element(parts(element).smartSnippet!).toBeInTheDocument();
      });
    });
  });

  describe('feedback functionality', () => {
    it('should call smartSnippet.like() when like button is clicked', async () => {
      const likeSpy = vi.spyOn(mockedSmartSnippet, 'like');
      await renderAtomicSmartSnippet();
      await page.getByRole('radiogroup').getByText('yes').click();
      expect(likeSpy).toHaveBeenCalled();
    });

    it('should call smartSnippet.dislike() when dislike button is clicked', async () => {
      const dislikeSpy = vi.spyOn(mockedSmartSnippet, 'dislike');
      await renderAtomicSmartSnippet();
      await page.getByRole('radiogroup').getByText('no').click();
      expect(dislikeSpy).toHaveBeenCalled();
    });

    it('should load modal when dislike button is clicked', async () => {
      const {element} = await renderAtomicSmartSnippet();
      await page.getByRole('radiogroup').getByText('no').click();

      await vi.waitFor(() => {
        const modal = element
          .getRootNode()
          .querySelector('atomic-smart-snippet-feedback-modal');
        expect(modal).not.toBeNull();
      });
    });
  });

  describe('inline link events', () => {
    it('should call smartSnippet.selectInlineLink() when selectInlineLink event is dispatched', async () => {
      const selectInlineLinkSpy = vi.spyOn(
        mockedSmartSnippet,
        'selectInlineLink'
      );
      const {element} = await renderAtomicSmartSnippet();
      const inlineLink: InlineLink = {
        linkText: 'test',
        linkURL: 'https://example.com',
      };
      element.dispatchEvent(
        new CustomEvent('selectInlineLink', {detail: inlineLink})
      );
      expect(selectInlineLinkSpy).toHaveBeenCalledWith(inlineLink);
    });

    it('should call smartSnippet.beginDelayedSelectInlineLink() when beginDelayedSelectInlineLink event is dispatched', async () => {
      const beginDelayedSelectInlineLinkSpy = vi.spyOn(
        mockedSmartSnippet,
        'beginDelayedSelectInlineLink'
      );
      const {element} = await renderAtomicSmartSnippet();
      const inlineLink: InlineLink = {
        linkText: 'test',
        linkURL: 'https://example.com',
      };
      element.dispatchEvent(
        new CustomEvent('beginDelayedSelectInlineLink', {detail: inlineLink})
      );
      expect(beginDelayedSelectInlineLinkSpy).toHaveBeenCalledWith(inlineLink);
    });

    it('should call smartSnippet.cancelPendingSelectInlineLink() when cancelPendingSelectInlineLink event is dispatched', async () => {
      const cancelPendingSelectInlineLinkSpy = vi.spyOn(
        mockedSmartSnippet,
        'cancelPendingSelectInlineLink'
      );
      const {element} = await renderAtomicSmartSnippet();
      const inlineLink: InlineLink = {
        linkText: 'test',
        linkURL: 'https://example.com',
      };
      element.dispatchEvent(
        new CustomEvent('cancelPendingSelectInlineLink', {detail: inlineLink})
      );
      expect(cancelPendingSelectInlineLinkSpy).toHaveBeenCalledWith(inlineLink);
    });
  });

  describe('expandable answer integration', () => {
    it('should call smartSnippet.expand() when expand event is dispatched', async () => {
      const expandSpy = vi.spyOn(mockedSmartSnippet, 'expand');
      const {element} = await renderAtomicSmartSnippet();
      const expandableAnswer = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-expandable-answer'
      );
      expandableAnswer?.dispatchEvent(new CustomEvent('expand'));
      expect(expandSpy).toHaveBeenCalled();
    });

    it('should call smartSnippet.collapse() when collapse event is dispatched', async () => {
      const collapseSpy = vi.spyOn(mockedSmartSnippet, 'collapse');
      const {element} = await renderAtomicSmartSnippet();
      const expandableAnswer = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-expandable-answer'
      );
      expandableAnswer?.dispatchEvent(new CustomEvent('collapse'));
      expect(collapseSpy).toHaveBeenCalled();
    });
  });

  describe('props', () => {
    it('should pass headingLevel prop to question renderer', async () => {
      const {element, parts} = await renderAtomicSmartSnippet({
        props: {headingLevel: 2},
      });
      expect(element.headingLevel).toBe(2);
      await expect.element(parts(element).question!).toBeInTheDocument();
    });

    it('should pass maximumHeight prop to expandable answer', async () => {
      const {element} = await renderAtomicSmartSnippet({
        props: {maximumHeight: 300},
      });
      const expandableAnswer = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-expandable-answer'
      );
      expect(element.maximumHeight).toBe(300);
      await expect.element(expandableAnswer!).toBeInTheDocument();
    });

    it('should pass collapsedHeight prop to expandable answer', async () => {
      const {element} = await renderAtomicSmartSnippet({
        props: {collapsedHeight: 150},
      });
      const expandableAnswer = element.shadowRoot?.querySelector(
        'atomic-smart-snippet-expandable-answer'
      );
      expect(element.collapsedHeight).toBe(150);
      await expect.element(expandableAnswer!).toBeInTheDocument();
    });

    it('should accept snippetStyle prop', async () => {
      const customStyle = 'b { color: blue; }';
      const {element} = await renderAtomicSmartSnippet({
        props: {snippetStyle: customStyle},
      });
      expect(element.snippetStyle).toBe(customStyle);
    });
  });

  describe('event listener cleanup', () => {
    it('should remove event listeners when disconnected', async () => {
      const {element} = await renderAtomicSmartSnippet();
      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');
      element.disconnectedCallback();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'selectInlineLink',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beginDelayedSelectInlineLink',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'cancelPendingSelectInlineLink',
        expect.any(Function)
      );
    });
  });
});
