import * as guardModule from '@/src/decorators/error-guard';
import * as utils from '@/src/utils/utils';
import {fixture} from '@/tests/testing-helpers/fixture';
import {page} from '@vitest/browser/context';
// TODO: import @vitest/browser this for all test files
import '@vitest/browser/matchers.d.ts';
import DOMPurify from 'dompurify';
import {html} from 'lit';
import {expect, MockInstance, vi} from 'vitest';
import './atomic-icon';
import {AtomicIcon} from './atomic-icon';

vi.mock('@/src/utils/utils', () => ({
  parseAssetURL: vi.fn(),
}));
vi.mock('@/src/decorators/error-guard', () => ({
  errorGuard: vi.fn(),
}));
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

describe('AtomicIcon', () => {
  let fetchMock: MockInstance;
  let parseAssetURLMock: MockInstance;
  let errorGuardMock: MockInstance;
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

  beforeAll(() => {
    fetchMock = vi.spyOn(window, 'fetch');
    parseAssetURLMock = vi.spyOn(utils, 'parseAssetURL');
    errorGuardMock = vi.spyOn(guardModule, 'errorGuard');
    sanitizeMock = vi.spyOn(DOMPurify, 'sanitize');
  });

  afterEach(() => {
    fetchMock.mockReset();
    parseAssetURLMock.mockReset();
    sanitizeMock.mockReset();
  });

  const setupElement = async (icon: string) => {
    const element = await fixture<AtomicIcon>(
      html` <atomic-icon icon=${icon}></atomic-icon>`
    );

    element.initialize();

    return element;
  };

  it('is defined', () => {
    const el = document.createElement('atomic-icon');
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
      .toContainHTML('<circle r="40" cy="50" cx="50"></circle>');
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
      .toContainHTML('<circle r="40" cy="50" cx="50"></circle>');
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
    parseAssetURLMock.mockReturnValue('http://example.com/icon.svg');
    fetchMock.mockRejectedValue(new Error('Network error'));

    await setupElement('http://example.com/icon.svg');
    expect(errorGuardMock).toHaveBeenCalled();
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
