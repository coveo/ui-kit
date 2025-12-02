import type {Result} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {AtomicResultIcon} from './atomic-result-icon';
import './atomic-result-icon';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-result-icon', () => {
  let mockResult: Result;

  const renderComponent = async (options: {result?: Result} = {}) => {
    const resultToUse = options.result ?? mockResult;
    const {element, atomicResult, atomicInterface} =
      await renderInAtomicResult<AtomicResultIcon>({
        template: html`<atomic-result-icon></atomic-result-icon>`,
        selector: 'atomic-result-icon',
        result: resultToUse,
        bindings: (bindings) => {
          bindings.engine.logger = {warn: vi.fn()} as never;
          bindings.store = {
            ...bindings.store,
            onChange: vi.fn(),
            state: {
              ...bindings.store?.state,
              loadingFlags: [],
              iconAssetsPath: '',
            },
          };
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await atomicResult.updateComplete;
    await element?.updateComplete;

    return {
      element,
      getAtomicIcon: () => element?.shadowRoot?.querySelector('atomic-icon'),
      getSlot: () => element?.shadowRoot?.querySelector('slot'),
    };
  };

  beforeEach(() => {
    mockResult = buildFakeResult({
      raw: {
        filetype: 'pdf',
        objecttype: undefined,
        urihash: '',
      },
    });
  });

  it('should be defined', () => {
    const el = document.createElement('atomic-result-icon');
    expect(el).toBeInstanceOf(AtomicResultIcon);
  });

  describe('when the rendered result has a known filetype', () => {
    beforeEach(() => {
      mockResult = buildFakeResult({
        raw: {
          filetype: 'pdf',
          objecttype: undefined,
          urihash: '',
        },
      });
    });

    it('should render the icon of the filetype', async () => {
      const {getAtomicIcon} = await renderComponent();
      const icon = getAtomicIcon();

      expect(icon).toBeDefined();
      expect(icon?.getAttribute('icon')).toBe('assets://pdf');
      expect(icon?.getAttribute('title')).toBe('pdf');
    });

    it('should not render a slot', async () => {
      const {getSlot} = await renderComponent();
      expect(getSlot()).toBeNull();
    });

    it('should be accessible', async () => {
      await renderComponent();
      await expect.element(page.getByTitle('pdf')).toBeInTheDocument();
    });
  });

  describe('when the rendered result has a known objecttype', () => {
    beforeEach(() => {
      mockResult = buildFakeResult({
        raw: {
          filetype: undefined,
          objecttype: 'account',
          urihash: '',
        },
      });
    });

    it('should render the icon of the objecttype', async () => {
      const {getAtomicIcon} = await renderComponent();
      const icon = getAtomicIcon();

      expect(icon).toBeDefined();
      expect(icon?.getAttribute('icon')).toBe('assets://account');
      expect(icon?.getAttribute('title')).toBe('account');
    });

    it('should not render a slot', async () => {
      const {getSlot} = await renderComponent();
      expect(getSlot()).toBeNull();
    });
  });

  describe('when the rendered result has both known filetype and objecttype', () => {
    beforeEach(() => {
      mockResult = buildFakeResult({
        raw: {
          filetype: 'pdf',
          objecttype: 'account',
          urihash: '',
        },
      });
    });

    it('should render the objecttype icon (objecttype takes precedence)', async () => {
      const {getAtomicIcon} = await renderComponent();
      const icon = getAtomicIcon();

      expect(icon).toBeDefined();
      expect(icon?.getAttribute('icon')).toBe('assets://account');
    });
  });

  describe('when the rendered result has no known filetype or objecttype', () => {
    beforeEach(() => {
      mockResult = buildFakeResult({
        raw: {
          filetype: 'unknowntype',
          objecttype: 'anotherunknown',
          urihash: '',
        },
      });
    });

    it('should render a slot with a generic document icon', async () => {
      const {getSlot, getAtomicIcon} = await renderComponent();

      // Should have a slot for fallback content
      expect(getSlot()).toBeDefined();

      // The icon should still render with the default 'document' icon
      const icon = getAtomicIcon();
      expect(icon).toBeDefined();
      expect(icon?.getAttribute('icon')).toBe('assets://document');
      expect(icon?.getAttribute('title')).toBe('document');
    });
  });

  describe('when the rendered result has undefined filetype and objecttype', () => {
    beforeEach(() => {
      mockResult = buildFakeResult({
        raw: {
          filetype: undefined,
          objecttype: undefined,
          urihash: '',
        },
      });
    });

    it('should render a slot with a generic document icon', async () => {
      const {getSlot, getAtomicIcon} = await renderComponent();

      // Should have a slot for fallback content
      expect(getSlot()).toBeDefined();

      // The icon should still render with the default 'document' icon
      const icon = getAtomicIcon();
      expect(icon).toBeDefined();
      expect(icon?.getAttribute('icon')).toBe('assets://document');
    });
  });

  describe('license property', () => {
    it('should have a license property', async () => {
      const {element} = await renderComponent();

      expect(element?.license).toBeDefined();
      expect(element?.license).toContain('Salesforce');
      expect(element?.license).toContain('Creative Commons');
    });
  });
});
