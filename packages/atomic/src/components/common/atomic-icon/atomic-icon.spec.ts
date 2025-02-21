import * as guardModule from '@/src/decorators/error-guard';
import * as utils from '@/src/utils/utils';
import {fixture, assert} from '@open-wc/testing';
import DOMPurify from 'dompurify';
import {html} from 'lit/static-html.js';
import {within} from 'shadow-dom-testing-library';
import {MockInstance, vi} from 'vitest';
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
  let container: HTMLElement;
  let fetchMock: MockInstance;
  let parseAssetURLMock: MockInstance;
  let errorGuardMock: MockInstance;
  let sanitizeMock: MockInstance;
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

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    fetchMock.mockReset();
    parseAssetURLMock.mockReset();
    sanitizeMock.mockReset();
  });

  const setupElement = async (icon: string) => {
    const element = await fixture<AtomicIcon>(html`
      <atomic-icon icon=${icon}></atomic-icon>
    `);

    element.initialize();

    container.appendChild(element);
    return element;
  };

  it('is defined', () => {
    const el = document.createElement('atomic-icon');
    assert.instanceOf(el, AtomicIcon);
  });

  it('renders with default values', async () => {
    parseAssetURLMock.mockReturnValue('/assets/user.svg');
    fetchMock.mockResolvedValue(successfullResponse);

    await setupElement('assets://user.svg');
    const svg = await within(container).findByShadowTestId('mocked-icon');

    expect(fetchMock).toHaveBeenCalledWith('/assets/user.svg');
    expect(svg).toContainHTML('<circle r="40" cy="50" cx="50"></circle>');
  });

  it('should sanitizes the SVG content', async () => {
    await setupElement(
      "<svg data-testid='mocked-icon'><script>alert('xss')</script><circle cx='50' cy='50' r='40' /></svg>"
    );

    const svg = await within(container).findByShadowTestId('mocked-icon');

    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector('script')).not.toBeInTheDocument();
  });

  it('fetches and renders the SVG icon from a URL', async () => {
    parseAssetURLMock.mockReturnValue('http://example.com/icon.svg');
    fetchMock.mockResolvedValue(successfullResponse);

    await setupElement('http://example.com/icon.svg');
    const svg = await within(container).findByShadowTestId('mocked-icon');

    expect(fetchMock).toHaveBeenCalledWith('http://example.com/icon.svg');
    expect(svg).toContainHTML('<circle r="40" cy="50" cx="50"></circle>');
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
