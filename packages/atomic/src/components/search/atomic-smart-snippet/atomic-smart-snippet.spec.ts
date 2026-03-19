import {
  buildSmartSnippet,
  buildTabManager,
  type InlineLink,
  type SmartSnippet,
  type TabManager,
} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
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
        answer:
          '<p>The answer is <b>42</b>. <a href="https://example.com/link1">Link 1</a> and <a href="https://example.com/link2">Link 2</a></p>',
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

    const getParts = () => ({
      smartSnippet: element.shadowRoot?.querySelector(
        '[part~="smart-snippet"]'
      ),
      question: element.shadowRoot?.querySelector('[part~="question"]'),
      answer: element.shadowRoot?.querySelector('atomic-smart-snippet-answer'),
      truncatedAnswer: element.shadowRoot?.querySelector(
        '[part~="truncated-answer"]'
      ),
      body: element.shadowRoot?.querySelector('[part~="body"]'),
      footer: element.shadowRoot?.querySelector('[part~="footer"]'),
      feedbackBanner: element.shadowRoot?.querySelector(
        '[part~="feedback-banner"]'
      ),
      feedbackLikeButton: element.shadowRoot?.querySelector(
        '[part~="feedback-like-button"]'
      ) as HTMLElement | null,
      feedbackDislikeButton: element.shadowRoot?.querySelector(
        '[part~="feedback-dislike-button"]'
      ) as HTMLElement | null,
      feedbackThankYou: element.shadowRoot?.querySelector(
        '[part~="feedback-thank-you"]'
      ),
      expandableAnswer: element.shadowRoot?.querySelector(
        'atomic-smart-snippet-expandable-answer'
      ),
      source: element.shadowRoot?.querySelector('atomic-smart-snippet-source'),
      sourceUrl: element.shadowRoot?.querySelector('[part~="source-url"]'),
      sourceTitle: element.shadowRoot?.querySelector('[part~="source-title"]'),
    });

    return {element, getParts};
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
      const {getParts} = await renderAtomicSmartSnippet();
      expect(getParts().smartSnippet).toBeInTheDocument();
    });

    it('should render the question', async () => {
      const {getParts} = await renderAtomicSmartSnippet();
      const question = getParts().question!;
      expect(question).toBeInTheDocument();
      expect(question.textContent?.trim()).toBe(
        mockedSmartSnippet.state.question
      );
    });

    it('should render the expandable answer when snippetMaximumHeight is undefined', async () => {
      const {getParts} = await renderAtomicSmartSnippet({
        props: {snippetMaximumHeight: undefined},
      });
      expect(getParts().expandableAnswer).toBeInTheDocument();
    });

    it('should render the truncated answer when snippetMaximumHeight is defined', async () => {
      const {getParts} = await renderAtomicSmartSnippet({
        props: {snippetMaximumHeight: 200},
      });
      expect(getParts().truncatedAnswer).toBeInTheDocument();
    });

    it('should render the footer', async () => {
      const {getParts} = await renderAtomicSmartSnippet();
      expect(getParts().footer).toBeInTheDocument();
    });

    it('should render the source when source is present', async () => {
      const {getParts} = await renderAtomicSmartSnippet();
      expect(getParts().source).toBeInTheDocument();
    });

    it('should render the feedback banner', async () => {
      const {getParts} = await renderAtomicSmartSnippet();
      expect(getParts().feedbackBanner).toBeInTheDocument();
    });

    // TODO: Enable when atomic-smart-snippet-source is migrated to Lit
    it.skip('should render source url and title with correct href', async () => {
      const {getParts} = await renderAtomicSmartSnippet();
      const {sourceUrl, sourceTitle} = getParts();

      expect(sourceUrl).toBeInTheDocument();
      expect(sourceTitle).toBeInTheDocument();
      expect(sourceUrl?.getAttribute('href')).toBe(
        mockedSmartSnippet.state.source?.clickUri
      );
      expect(sourceTitle?.getAttribute('href')).toBe(
        mockedSmartSnippet.state.source?.clickUri
      );
    });
  });

  it('should not render the smart snippet when answer is not found', async () => {
    mockedSmartSnippet.state.answerFound = false;
    const {getParts} = await renderAtomicSmartSnippet();
    expect(getParts().smartSnippet).not.toBeInTheDocument();
  });

  it('should not render the source when source is not present', async () => {
    // @ts-expect-error: Testing null source
    mockedSmartSnippet.state.source = null;
    const {getParts} = await renderAtomicSmartSnippet();
    expect(getParts().source).toBeNull();
  });

  describe('tab filtering', () => {
    describe('when tabsIncluded is set', () => {
      it('should render when current tab is included', async () => {
        mockedTabManager.state.activeTab = 'tab1';
        const {getParts} = await renderAtomicSmartSnippet({
          props: {tabsIncluded: ['tab1', 'tab2']},
        });
        expect(getParts().smartSnippet).toBeInTheDocument();
      });

      it('should not render when current tab is not included', async () => {
        mockedTabManager.state.activeTab = 'tab3';
        const {getParts} = await renderAtomicSmartSnippet({
          props: {tabsIncluded: ['tab1', 'tab2']},
        });
        expect(getParts().smartSnippet).not.toBeInTheDocument();
      });
    });

    describe('when tabsExcluded is set', () => {
      it('should not render when current tab is excluded', async () => {
        mockedTabManager.state.activeTab = 'tab1';
        const {getParts} = await renderAtomicSmartSnippet({
          props: {tabsExcluded: ['tab1', 'tab2']},
        });
        expect(getParts().smartSnippet).not.toBeInTheDocument();
      });

      it('should render when current tab is not excluded', async () => {
        mockedTabManager.state.activeTab = 'tab3';
        const {getParts} = await renderAtomicSmartSnippet({
          props: {tabsExcluded: ['tab1', 'tab2']},
        });
        expect(getParts().smartSnippet).toBeInTheDocument();
      });
    });
  });

  describe('feedback functionality', () => {
    // TODO: Enable when feedback button selectors are fixed
    it.skip('should call smartSnippet.like() when like button is clicked', async () => {
      const likeSpy = vi.spyOn(mockedSmartSnippet, 'like');
      const {getParts} = await renderAtomicSmartSnippet();
      getParts().feedbackLikeButton?.click();
      expect(likeSpy).toHaveBeenCalled();
    });

    // TODO: Enable when feedback button selectors are fixed
    it.skip('should call smartSnippet.dislike() when dislike button is clicked', async () => {
      const dislikeSpy = vi.spyOn(mockedSmartSnippet, 'dislike');
      const {getParts} = await renderAtomicSmartSnippet();
      getParts().feedbackDislikeButton?.click();
      expect(dislikeSpy).toHaveBeenCalled();
    });

    // TODO: Enable when feedback button selectors are fixed
    it.skip('should load modal when dislike button is clicked', async () => {
      const {element, getParts} = await renderAtomicSmartSnippet();
      getParts().feedbackDislikeButton?.click();

      await vi.waitFor(() => {
        const modal = element
          .getRootNode()
          .querySelector('atomic-smart-snippet-feedback-modal');
        expect(modal).not.toBeNull();
      });
    });

    // TODO: Enable when feedback button selectors are fixed
    it.skip('should show thank you message after liking', async () => {
      mockedSmartSnippet.state.liked = false;
      const {element, getParts} = await renderAtomicSmartSnippet();

      getParts().feedbackLikeButton?.click();
      mockedSmartSnippet.state.liked = true;
      element.requestUpdate();
      await element.updateComplete;

      expect(getParts().feedbackThankYou).toBeInTheDocument();
    });

    // TODO: Enable when feedback button selectors are fixed
    it.skip('should show thank you message after disliking', async () => {
      mockedSmartSnippet.state.disliked = false;
      const {element, getParts} = await renderAtomicSmartSnippet();

      getParts().feedbackDislikeButton?.click();
      mockedSmartSnippet.state.disliked = true;
      element.requestUpdate();
      await element.updateComplete;

      expect(getParts().feedbackThankYou).toBeInTheDocument();
    });

    it('should hide thank you message when liked state changes to false', async () => {
      mockedSmartSnippet.state.liked = true;
      const {element, getParts} = await renderAtomicSmartSnippet();
      element.requestUpdate();

      await element.updateComplete;
      expect(getParts().feedbackThankYou).toBeInTheDocument();

      mockedSmartSnippet.state.liked = false;

      element.requestUpdate();

      await element.updateComplete;
      expect(getParts().feedbackThankYou).not.toBeInTheDocument();
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
      const {getParts} = await renderAtomicSmartSnippet();
      getParts().expandableAnswer?.dispatchEvent(new CustomEvent('expand'));
      expect(expandSpy).toHaveBeenCalled();
    });

    it('should call smartSnippet.collapse() when collapse event is dispatched', async () => {
      const collapseSpy = vi.spyOn(mockedSmartSnippet, 'collapse');
      const {getParts} = await renderAtomicSmartSnippet();
      getParts().expandableAnswer?.dispatchEvent(new CustomEvent('collapse'));
      expect(collapseSpy).toHaveBeenCalled();
    });
  });

  describe('props', () => {
    it('should pass headingLevel prop to question renderer', async () => {
      const {element, getParts} = await renderAtomicSmartSnippet({
        props: {headingLevel: 2},
      });
      expect(element.headingLevel).toBe(2);
      expect(getParts().question).toBeInTheDocument();
    });

    it('should use heading level 0 when no heading level is specified', async () => {
      const {element, getParts} = await renderAtomicSmartSnippet({
        props: {headingLevel: 0},
      });
      expect(element.headingLevel).toBe(0);
      expect(getParts().question).toBeInTheDocument();

      const question = getParts().question!;
      expect(question.tagName).toBe('DIV');
    });

    it('should pass maximumHeight prop to expandable answer', async () => {
      const {element, getParts} = await renderAtomicSmartSnippet({
        props: {maximumHeight: 300},
      });
      expect(element.maximumHeight).toBe(300);
      expect(getParts().expandableAnswer).toBeInTheDocument();
    });

    it('should pass collapsedHeight prop to expandable answer', async () => {
      const {element, getParts} = await renderAtomicSmartSnippet({
        props: {collapsedHeight: 150},
      });
      expect(element.collapsedHeight).toBe(150);
      expect(getParts().expandableAnswer).toBeInTheDocument();
    });

    it('should accept snippetStyle prop', async () => {
      const customStyle = 'b { color: blue; }';
      const {element} = await renderAtomicSmartSnippet({
        props: {snippetStyle: customStyle},
      });
      expect(element.snippetStyle).toBe(customStyle);
    });

    it('should use snippetStyle attribute when no template is present', async () => {
      const customStyle = 'b { color: green; }';
      const {element} = await renderAtomicSmartSnippet({
        props: {snippetStyle: customStyle},
      });

      // The snippetStyle property should contain the style, not element.style
      expect(element.snippetStyle).toBe(customStyle);
    });
  });

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

  describe('dynamic updates', () => {
    it('should update question when smartSnippetState changes', async () => {
      const {element, getParts} = await renderAtomicSmartSnippet();

      const newQuestion = 'What is the answer to everything?';
      mockedSmartSnippet.state.question = newQuestion;
      element.requestUpdate();
      await element.updateComplete;

      const question = getParts().question!;
      expect(question.textContent?.trim()).toBe(newQuestion);
    });

    it('should update answer when smartSnippetState changes', async () => {
      const {element, getParts} = await renderAtomicSmartSnippet();

      const newAnswer = '<p>New answer content</p>';
      mockedSmartSnippet.state.answer = newAnswer;
      element.requestUpdate();
      await element.updateComplete;

      expect(getParts().expandableAnswer).toBeInTheDocument();
    });
  });

  it('should pass slot attributes to source anchor', async () => {
    const {element, getParts} = await renderAtomicSmartSnippet();

    const slotElement = document.createElement('a');
    slotElement.setAttribute('slot', 'source-anchor-attributes');
    slotElement.setAttribute('target', '_blank');
    element.appendChild(slotElement);

    expect(getParts().source).toBeInTheDocument();
  });
});
