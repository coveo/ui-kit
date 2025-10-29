import DOMPurify from 'dompurify';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicHtml} from './atomic-html';
import './atomic-html';

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html: string) => `sanitized: ${html}`),
  },
}));

describe('atomic-html', () => {
  const renderComponent = async (props: Partial<AtomicHtml> = {}) => {
    const element = await fixture<AtomicHtml>(
      html`<atomic-html
        .value=${props.value ?? '<p>Test content</p>'}
        .sanitize=${props.sanitize ?? true}
      ></atomic-html>`
    );

    const locators = {
      get span() {
        return element.shadowRoot?.querySelector('span');
      },
    };

    return {element, locators};
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    const {element} = await renderComponent();
    expect(element).toBeDefined();
  });

  it('should render with default properties', async () => {
    const {element} = await renderComponent();
    expect(element.sanitize).toBe(true);
  });

  it('should display HTML content when value is provided', async () => {
    const testContent = '<p>Test paragraph</p>';
    const {locators} = await renderComponent({value: testContent});

    expect(locators.span).toBeVisible();
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(testContent);
  });

  it('should sanitize content when sanitize is true', async () => {
    const testContent = '<script>alert("xss")</script><p>Safe content</p>';
    await renderComponent({value: testContent, sanitize: true});

    expect(DOMPurify.sanitize).toHaveBeenCalledWith(testContent);
  });

  it('should not sanitize content when sanitize is false', async () => {
    const testContent = '<p>Unsafe content</p>';
    const {locators} = await renderComponent({
      value: testContent,
      sanitize: false,
    });

    expect(DOMPurify.sanitize).not.toHaveBeenCalled();
    expect(locators.span?.innerHTML).toBe(testContent);
  });

  it('should not set error when value is provided', async () => {
    const {element} = await renderComponent({value: '<p>Valid content</p>'});

    expect(element.error).toBeUndefined();
  });

  describe('#initialize', () => {
    it('should not throw when value is provided', async () => {
      const {element} = await renderComponent({value: 'test'});

      expect(() => element.initialize()).not.toThrow();
    });

    it('should throw validation error when value is empty', async () => {
      const {element} = await renderComponent({value: ''});

      expect(() => element.initialize()).toThrow('value is an empty string');
    });
  });
});
