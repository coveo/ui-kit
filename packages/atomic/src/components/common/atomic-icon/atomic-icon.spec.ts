import DOMPurify from 'dompurify';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import * as assetPathUtils from '@/src/utils/asset-path-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {AtomicIcon} from './atomic-icon';
import './atomic-icon';

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
  const fetchMock = vi.fn();
  let parseAssetURLMock: MockInstance;
  let sanitizeMock: MockInstance;
  const locators = {
    get svg() {
      return page.getByTestId('mocked-icon');
    },
  };
  const successfullResponse = {
    ok: true,
    status: 200,
    text: async () =>
      '<svg data-testid="mocked-icon"><circle cx="50" cy="50" r="40" /></svg>',
  } as Response;

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    parseAssetURLMock = vi.mocked(assetPathUtils.parseAssetURL);
    sanitizeMock = vi.spyOn(DOMPurify, 'sanitize');
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
    fetchMock.mockResolvedValue(successfullResponse);
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
    fetchMock.mockResolvedValue(successfullResponse);

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
});
