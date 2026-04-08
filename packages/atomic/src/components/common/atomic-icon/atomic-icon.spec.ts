import DOMPurify from 'dompurify';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import * as assetPathUtils from '@/src/utils/asset-path-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {AtomicIcon} from './atomic-icon';
import {clearIconCache} from './fetch-icon';
import './atomic-icon';

// Hoist fetch mock to ensure it's in place before the following import chains:
//  [atomic-icon.spec.ts]─►[atomic-icon.ts]─┐
//  [atomic-icon.spec.ts]─►[atomic-icon.ts]─┴─►[fetch-icon.ts]
// Because [fetch-icon.ts] uses fetch during its initialization to create the exported memoized function.
const fetchMock = vi.hoisted(() => vi.spyOn(window, 'fetch'));

vi.mock('@/src/utils/asset-path-utils', {spy: true});
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      constructor(...args: unknown[]) {
        super(...args);
        this.bindings = {
          store: {
            state: {
              iconAssetsPath: './assets',
            },
          },
        };
      }
    };
  }),
}));

describe('atomic-icon', () => {
  let parseAssetURLMock: MockInstance;
  let sanitizeMock: MockInstance;
  const locators = {
    get svg() {
      return page.getByTestId('mocked-icon');
    },
  };
  const successfulResponse = {
    ok: true,
    status: 200,
    text: async () =>
      '<svg data-testid="mocked-icon"><circle cx="50" cy="50" r="40" /></svg>',
  } as Response;

  beforeEach(() => {
    parseAssetURLMock = vi.mocked(assetPathUtils.parseAssetURL);
    sanitizeMock = vi.spyOn(DOMPurify, 'sanitize');
    fetchMock.mockClear();
    fetchMock.mockRejectedValue(new Error('fetch not mocked'));
    clearIconCache();
  });

  const setupElement = async (icon: string) => {
    const element = await fixture<AtomicIcon>(
      html` <atomic-icon icon=${icon}></atomic-icon>`
    );

    await element.initialize();
    // The atomic-icon runs asynchronous operation behind a guard, meaning the first render is _not_ the one we ought to assert on
    await new Promise((resolve) => setTimeout(resolve, 0));
    return element;
  };

  it('is defined', async () => {
    const el = await setupElement('assets://user.svg');
    expect(el).toBeInstanceOf(AtomicIcon);
  });

  it('renders with default values', async () => {
    parseAssetURLMock.mockReturnValue('/assets/user.svg');
    fetchMock.mockResolvedValue(successfulResponse);
    await setupElement('assets://user.svg');

    expect(fetchMock).toHaveBeenCalledWith('/assets/user.svg');

    await expect.element(locators.svg).toBeInTheDocument();
    await expect
      .element(locators.svg)
      .toContainHTML('<circle cx="50" cy="50" r="40" />');
  });

  it('should sanitizes the SVG content', async () => {
    await setupElement(
      "<svg data-testid='mocked-icon'><script data-testid=\"script\" role>alert('xss')</script><circle cx='50' cy='50' r='40' /></svg>"
    );

    await expect.element(locators.svg).toBeInTheDocument();
    await expect
      .element(locators.svg.getByTestId('script'))
      .not.toBeInTheDocument();
  });

  it('fetches and renders the SVG icon from a URL', async () => {
    parseAssetURLMock.mockReturnValue('http://example.com/icon.svg');
    fetchMock.mockResolvedValue(successfulResponse);

    await setupElement('http://example.com/icon.svg');

    expect(fetchMock).toHaveBeenCalledWith('http://example.com/icon.svg');
    await expect
      .element(locators.svg)
      .toContainHTML('<circle cx="50" cy="50" r="40" />');
  });

  it('calls parseAssetURL with the correct arguments', async () => {
    parseAssetURLMock.mockReturnValue('/assets/icon.svg');
    await setupElement('assets://icon.svg');
    expect(parseAssetURLMock).toHaveBeenCalledWith(
      'assets://icon.svg',
      './assets'
    );
  });

  it('handles fetch errors gracefully', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    parseAssetURLMock.mockReturnValue('http://example.com/icon.svg');
    fetchMock.mockRejectedValue(new Error('Network error'));

    await setupElement('http://example.com/icon.svg');

    await expect
      .element(page.getByText('atomic-icon component error'))
      .toBeInTheDocument();
  });

  it('calls fetchIcon with the correct arguments', async () => {
    parseAssetURLMock.mockReturnValue(null);
    await setupElement("<svg><circle cx='50' cy='50' r='40' /></svg>");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls DOMPurify.sanitize with the correct arguments', async () => {
    await setupElement("<svg><circle cx='50' cy='50' r='40' /></svg>");
    expect(sanitizeMock).toHaveBeenCalledWith(
      "<svg><circle cx='50' cy='50' r='40' /></svg>",
      {
        USE_PROFILES: {svg: true, svgFilters: true},
      }
    );
  });

  describe('caching', () => {
    it('should cache fetch requests for the same URL', async () => {
      parseAssetURLMock.mockReturnValue('/assets/star.svg');
      fetchMock.mockResolvedValue(successfulResponse);

      await setupElement('assets://star.svg');
      await setupElement('assets://star.svg');
      await setupElement('assets://star.svg');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith('/assets/star.svg');
    });

    it('should make separate fetch requests for different URLs', async () => {
      const response1 = {
        ok: true,
        status: 200,
        text: async () => '<svg data-testid="icon1"></svg>',
      } as Response;

      const response2 = {
        ok: true,
        status: 200,
        text: async () => '<svg data-testid="icon2"></svg>',
      } as Response;

      parseAssetURLMock.mockReturnValueOnce('/assets/icon1.svg');
      parseAssetURLMock.mockReturnValueOnce('/assets/icon2.svg');
      fetchMock.mockResolvedValueOnce(response1);
      fetchMock.mockResolvedValueOnce(response2);

      await setupElement('assets://icon1.svg');
      await setupElement('assets://icon2.svg');

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledWith('/assets/icon1.svg');
      expect(fetchMock).toHaveBeenCalledWith('/assets/icon2.svg');
    });

    it('should not cache failed fetch requests and allow retry', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      parseAssetURLMock.mockReturnValue('http://example.com/icon.svg');
      fetchMock
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(successfulResponse);

      await setupElement('http://example.com/icon.svg');
      await expect
        .element(page.getByText('atomic-icon component error'))
        .toBeInTheDocument();

      await setupElement('http://example.com/icon.svg');

      expect(fetchMock).toHaveBeenCalledTimes(2);
      await expect.element(locators.svg).toBeInTheDocument();
    });

    it('should allow cache clearing and re-fetching', async () => {
      parseAssetURLMock.mockReturnValue('/assets/icon.svg');
      fetchMock.mockResolvedValue(successfulResponse);

      await setupElement('assets://icon.svg');
      expect(fetchMock).toHaveBeenCalledTimes(1);

      clearIconCache();

      await setupElement('assets://icon.svg');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
