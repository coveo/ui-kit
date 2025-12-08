import {
  buildInteractiveResult,
  type InteractiveResult,
  type Result,
} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicResult} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-result-fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicResultPrintableUri} from './atomic-result-printable-uri';
import './atomic-result-printable-uri';

vi.mock('@coveo/headless', {spy: true});

const buildFakeInteractiveResult = (
  interactiveResult?: Partial<InteractiveResult>
): InteractiveResult => ({
  select: vi.fn(),
  beginDelayedSelect: vi.fn(),
  cancelPendingSelect: vi.fn(),
  ...interactiveResult,
});

const getNameForPart = (index: number) => `Parent ${index + 1}`;

const getUriForPart = (index: number) =>
  'https://example.com/' +
  Array.from({length: index + 1}, (_, i) => `page${i + 1}`).join('/');

const createParentsXml = (numberOfParents: number) => {
  const parents = Array.from(
    {length: numberOfParents},
    (_, i) => `<parent name="${getNameForPart(i)}" uri="${getUriForPart(i)}" />`
  ).join('');

  return `<?xml version="1.0" encoding="utf-16"?><parents>${parents}</parents>`;
};

describe('atomic-result-printable-uri', () => {
  let i18n: i18n;
  let mockResult: Result;
  let mockInteractiveResult: InteractiveResult;

  beforeEach(async () => {
    i18n = await createTestI18n();

    mockResult = buildFakeResult({
      printableUri: 'https://example.com/printable',
      clickUri: 'https://example.com/click',
      raw: {
        urihash: 'hash',
      },
    });

    mockInteractiveResult = buildFakeInteractiveResult();

    vi.mocked(buildInteractiveResult).mockReturnValue(mockInteractiveResult);
  });

  const renderComponent = async (
    options: {maxNumberOfParts?: number; result?: Result} = {}
  ) => {
    const resultToUse = options.result ?? mockResult;
    const {element, atomicInterface} =
      await renderInAtomicResult<AtomicResultPrintableUri>({
        template: html`<atomic-result-printable-uri
          max-number-of-parts=${ifDefined(options.maxNumberOfParts)}
        ></atomic-result-printable-uri>`,
        selector: 'atomic-result-printable-uri',
        result: resultToUse,
        interactiveResult: mockInteractiveResult,
        bindings: (bindings) => {
          bindings.i18n = i18n;
          bindings.store = {
            ...bindings.store,
            onChange: vi.fn(),
            state: {
              ...bindings.store?.state,
              loadingFlags: [],
            },
          };
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return {
      element,
      locators: {
        list: () => element?.querySelector('ul'),
        listItems: () => element?.querySelectorAll('li'),
        links: () => element?.querySelectorAll('a'),
        ellipsisButton: () => element?.querySelector('button'),
      },
    };
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-result-printable-uri');
    expect(el).toBeInstanceOf(AtomicResultPrintableUri);
  });

  it('should render a link with atomic-result-text for printableUri when there is no "parents" property in the result object', async () => {
    const {element, locators} = await renderComponent();

    const links = locators.links();
    expect(links?.length).toBe(1);

    const link = links?.[0];
    expect(link?.getAttribute('href')).toBe('https://example.com/click');

    const resultText = element?.querySelector('atomic-result-text');
    expect(resultText).toBeTruthy();
    expect(resultText?.getAttribute('field')).toBe('printableUri');
  });

  describe('when there is a "parents" property in the result object', () => {
    describe('when the number of parts is less than or equal to max-number-of-parts', () => {
      beforeEach(() => {
        mockResult = buildFakeResult({
          raw: {
            urihash: 'hash',
            parents: createParentsXml(3),
          },
        });
      });

      it('should render all parents without ellipsis', async () => {
        const {locators} = await renderComponent({
          maxNumberOfParts: 5,
          result: mockResult,
        });

        const links = locators.links();
        expect(links?.length).toBe(3);
        expect(locators.ellipsisButton()).toBeNull();
      });

      it('should render the list with aria-label', async () => {
        const {locators} = await renderComponent({
          maxNumberOfParts: 5,
          result: mockResult,
        });

        const list = locators.list();
        // Uses the actual i18n translation key 'printable-uri'
        expect(list?.getAttribute('aria-label')).toBe(
          'Source path of the result'
        );
      });

      it('should render parent hrefs correctly', async () => {
        const {locators} = await renderComponent({
          maxNumberOfParts: 5,
          result: mockResult,
        });

        const links = locators.links();
        expect(links?.[0]?.getAttribute('href')).toBe(getUriForPart(0));
        expect(links?.[1]?.getAttribute('href')).toBe(getUriForPart(1));
        expect(links?.[2]?.getAttribute('href')).toBe(getUriForPart(2));
      });

      it('should render parent names correctly', async () => {
        const {locators} = await renderComponent({
          maxNumberOfParts: 5,
          result: mockResult,
        });

        const links = locators.links();
        expect(links?.[0]?.textContent?.trim()).toBe(getNameForPart(0));
        expect(links?.[1]?.textContent?.trim()).toBe(getNameForPart(1));
        expect(links?.[2]?.textContent?.trim()).toBe(getNameForPart(2));
      });
    });

    describe('when the number of parts is greater than max-number-of-parts', () => {
      beforeEach(() => {
        mockResult = buildFakeResult({
          raw: {
            urihash: 'hash',
            parents: createParentsXml(6),
          },
        });
      });

      it('should render ellipsis button', async () => {
        const {locators} = await renderComponent({
          maxNumberOfParts: 3,
          result: mockResult,
        });

        const ellipsisButton = locators.ellipsisButton();
        expect(ellipsisButton).toBeTruthy();
        expect(ellipsisButton?.textContent?.trim()).toBe('...');
        // Uses the actual i18n translation key 'collapsed-uri-parts'
        expect(ellipsisButton?.getAttribute('aria-label')).toBe(
          'Collapsed URI parts'
        );
      });

      it('should show limited number of links with ellipsis', async () => {
        const {locators} = await renderComponent({
          maxNumberOfParts: 3,
          result: mockResult,
        });

        const links = locators.links();
        // Shows some parents before ellipsis + last parent after
        expect(links?.length).toBeLessThan(6);
        expect(locators.ellipsisButton()).toBeTruthy();
      });

      it('should expand to show all parents when ellipsis is clicked', async () => {
        const {locators} = await renderComponent({
          maxNumberOfParts: 3,
          result: mockResult,
        });

        const ellipsisButton = locators.ellipsisButton();
        ellipsisButton?.click();

        await expect.poll(() => locators.links()?.length).toBe(6);
        expect(locators.ellipsisButton()).toBeNull();
      });
    });
  });

  it('should set error when max-number-of-parts is less than 3', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const {element} = await renderComponent({
      maxNumberOfParts: 2,
    });

    expect(element?.error).toBeDefined();

    consoleWarnSpy.mockRestore();
  });

  it('should call buildInteractiveResult with the engine and result', async () => {
    const result = buildFakeResult({
      raw: {
        urihash: 'hash',
        parents: createParentsXml(2),
      },
    });

    await renderComponent({result});

    expect(buildInteractiveResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        options: expect.objectContaining({
          result,
        }),
      })
    );
  });
});
