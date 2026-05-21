// @ts-ignore
import QuanticThreadItem from '../quanticThreadItem';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';

const selectors = {
  titleButton: '[data-testid="thread-item-title-button"]',
  titleSpan: '[data-testid="thread-item-title-static"]',
  boldTitle: '.slds-text-title_bold',
  contentWrapper: '[data-testid="thread-item-content"]',
  visibleContent: '[data-testid="thread-item-content"] > div:not([hidden])',
  line: '[data-testid="thread-item-line"]',
  dot: '[data-testid="thread-item-dot"]',
};

const createTestComponent = buildCreateTestComponent(
  QuanticThreadItem,
  'c-quantic-thread-item',
  {
    title: 'Test title',
  }
);

describe('c-quantic-thread-item', () => {
  afterEach(() => {
    cleanup();
  });

  describe('initial rendering', () => {
    it('renders a button when collapse is enabled', async () => {
      const element = createTestComponent();
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.titleButton);
      expect(button).not.toBeNull();
    });

    it('renders a span instead of a button when disableCollapse is true', async () => {
      const element = createTestComponent({disableCollapse: true});
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.titleButton);
      const span = element.shadowRoot.querySelector(selectors.titleSpan);
      expect(button).toBeNull();
      expect(span).not.toBeNull();
    });

    it('renders the timeline line by default', async () => {
      const element = createTestComponent();
      await flushPromises();

      const line = element.shadowRoot.querySelector(selectors.line);
      expect(line).not.toBeNull();
    });

    it('hides the timeline line when hideLine is true', async () => {
      const element = createTestComponent({hideLine: true});
      await flushPromises();

      const line = element.shadowRoot.querySelector(selectors.line);
      expect(line).toBeNull();
    });
  });

  describe('collapsed state', () => {
    it('does not render the content by default', async () => {
      const element = createTestComponent();
      await flushPromises();

      const content = element.shadowRoot.querySelector(selectors.visibleContent);
      expect(content).toBeNull();
    });

    it('button has aria-expanded set to false when collapsed', async () => {
      const element = createTestComponent();
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.titleButton);
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('dot does not have expanded class when collapsed', async () => {
      const element = createTestComponent();
      await flushPromises();

      const dot = element.shadowRoot.querySelector(selectors.dot);
      expect(dot.className).not.toContain('thread-item__dot--expanded');
    });
  });

  describe('expanded state', () => {
    it('renders the content when isExpanded is true', async () => {
      const element = createTestComponent({isExpanded: true});
      await flushPromises();

      const content = element.shadowRoot.querySelector(selectors.visibleContent);
      expect(content).not.toBeNull();
    });

    it('button has aria-expanded set to true when expanded', async () => {
      const element = createTestComponent({isExpanded: true});
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.titleButton);
      expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('dot has expanded class when expanded', async () => {
      const element = createTestComponent({isExpanded: true});
      await flushPromises();

      const dot = element.shadowRoot.querySelector(selectors.dot);
      expect(dot.className).toContain('thread-item__dot--expanded');
    });
  });

  describe('toggle interaction', () => {
    it('renders the content when the button is clicked while collapsed', async () => {
      const element = createTestComponent();
      await flushPromises();

      element.shadowRoot.querySelector(selectors.titleButton).click();
      await flushPromises();

      const content = element.shadowRoot.querySelector(selectors.visibleContent);
      expect(content).not.toBeNull();
    });

    it('does not render the content when the button is clicked while expanded', async () => {
      const element = createTestComponent({isExpanded: true});
      await flushPromises();

      element.shadowRoot.querySelector(selectors.titleButton).click();
      await flushPromises();

      const content = element.shadowRoot.querySelector(selectors.visibleContent);
      expect(content).toBeNull();
    });
  });

  describe('disableCollapse', () => {
    it('forces item to be expanded regardless of isExpanded prop', async () => {
      const element = createTestComponent({disableCollapse: true, isExpanded: false});
      await flushPromises();

      const content = element.shadowRoot.querySelector(selectors.visibleContent);
      expect(content).not.toBeNull();
    });

    it('renders a bold title when collapse is disabled', async () => {
      const element = createTestComponent({disableCollapse: true, isExpanded: false});
      await flushPromises();

      const title = element.shadowRoot.querySelector(selectors.titleSpan);
      expect(title.className).toContain('slds-text-title_bold');
      expect(element.shadowRoot.querySelector(selectors.boldTitle)).not.toBeNull();
    });
  });
});
