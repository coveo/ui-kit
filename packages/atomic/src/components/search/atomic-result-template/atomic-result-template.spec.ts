import type {Result} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, vi} from 'vitest';
import {ResultTemplateController} from '@/src/components/common/result-templates/result-template-controller.js';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeResult} from '@/vitest-utils/testing-helpers/fixtures/headless/search/result';
import {sanitizeHtml} from '@/vitest-utils/testing-helpers/testing-utils/sanitize-html';
import {AtomicResultTemplate} from './atomic-result-template.js';

vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});

describe('atomic-result-template', () => {
  type AtomicResultTemplateProps = Pick<
    AtomicResultTemplate,
    'conditions' | 'mustMatch' | 'mustNotMatch' | 'ifDefined' | 'ifNotDefined'
  >;

  const setupElement = async (options: Partial<AtomicResultTemplateProps> = {}) => {
    const defaultProps: AtomicResultTemplateProps = {
      conditions: [],
      mustMatch: {},
      mustNotMatch: {},
    };

    const container = document.createElement('atomic-result-list');
    const element = await fixture<AtomicResultTemplate>(
      html`
        <atomic-result-template
          .conditions=${options.conditions || defaultProps.conditions}
          .mustMatch=${options.mustMatch || defaultProps.mustMatch}
          .mustNotMatch=${options.mustNotMatch || defaultProps.mustNotMatch}
          if-defined=${ifDefined(options.ifDefined)}
          if-not-defined=${ifDefined(options.ifNotDefined)}
        >
          <template>
            <div>Result Template Content</div>
          </template>
        </atomic-result-template>
      `,
      container
    );
    return element;
  };

  it('should instantiate without errors', async () => {
    const element = await setupElement();
    expect(element).toBeInstanceOf(AtomicResultTemplate);
  });

  it('should have default empty mustMatch, mustNotMatch, and conditions', async () => {
    const element = await setupElement();
    expect(element.mustMatch).toEqual({});
    expect(element.mustNotMatch).toEqual({});
    expect(element.conditions).toEqual([]);
  });

  it('should have undefined ifDefined and ifNotDefined by default', async () => {
    const element = await setupElement();
    expect(element.ifDefined).toBeUndefined();
    expect(element.ifNotDefined).toBeUndefined();
  });

  it('should map the if-defined and if-not-defined attributes to ifDefined and ifNotDefined', async () => {
    const element = await setupElement({ifDefined: 'author,date', ifNotDefined: 'thumbnail'});
    expect(element.ifDefined).toBe('author,date');
    expect(element.ifNotDefined).toBe('thumbnail');
  });

  describe('when added to the DOM (#connectedCallback)', () => {
    it('should call the #makeMatchConditions util function with the correct arguments', async () => {
      const mockMakeMatchConditions = vi.mocked(makeMatchConditions);
      await setupElement({
        mustMatch: {filetype: ['pdf']},
        mustNotMatch: {source: ['spam']},
      });
      expect(mockMakeMatchConditions).toHaveBeenCalledExactlyOnceWith(
        {filetype: ['pdf']},
        {source: ['spam']},
        ResultTemplatesHelpers
      );
    });

    it('should set matchConditions on ResultTemplateController with correct value', async () => {
      const mustMatch = {filetype: ['pdf']};
      const mustNotMatch = {source: ['spam']};
      const element = await setupElement({mustMatch, mustNotMatch});

      const expected = makeMatchConditions(mustMatch, mustNotMatch, ResultTemplatesHelpers);

      const template = await element.getTemplate();
      expect(template).not.toBeNull();
      expect(template!.conditions).toHaveLength(expected.length);
    });

    it('should leave the #conditions property untouched', async () => {
      const customCondition = (result: Result) => result.title === 'Coveo';
      const element = await setupElement({conditions: [customCondition], ifDefined: 'author'});

      expect(element.conditions).toEqual([customCondition]);
    });

    it('should not accumulate conditions when reconnected to the DOM', async () => {
      const element = await setupElement({ifDefined: 'author', ifNotDefined: 'thumbnail'});
      const parent = element.parentElement!;

      element.remove();
      parent.append(element);

      const template = await element.getTemplate();
      expect(template!.conditions).toHaveLength(2);
    });
  });

  describe('when #ifDefined or #ifNotDefined is set', () => {
    const appliesTo = async (
      element: AtomicResultTemplate,
      resultState: Parameters<typeof buildFakeResult>[0]
    ) => {
      const template = await element.getTemplate();
      const result = buildFakeResult(resultState);
      return template!.conditions.every((condition) => condition(result));
    };

    it('should apply to a result that defines every field of if-defined', async () => {
      const element = await setupElement({ifDefined: 'author,date'});
      expect(await appliesTo(element, {raw: {author: 'Jane', date: 1}})).toBe(true);
    });

    it('should not apply to a result that does not define a field of if-defined', async () => {
      const element = await setupElement({ifDefined: 'author,date'});
      expect(await appliesTo(element, {raw: {author: 'Jane'}})).toBe(false);
    });

    it('should apply to a result that defines none of the fields of if-not-defined', async () => {
      const element = await setupElement({ifNotDefined: 'author,date'});
      expect(await appliesTo(element, {raw: {source: 'Coveo'}})).toBe(true);
    });

    it('should not apply to a result that defines a field of if-not-defined', async () => {
      const element = await setupElement({ifNotDefined: 'author,date'});
      expect(await appliesTo(element, {raw: {author: 'Jane'}})).toBe(false);
    });

    it('should never apply when if-defined and if-not-defined target the same field', async () => {
      const element = await setupElement({ifDefined: 'author', ifNotDefined: 'author'});
      expect(await appliesTo(element, {raw: {author: 'Jane'}})).toBe(false);
      expect(await appliesTo(element, {raw: {}})).toBe(false);
    });

    describe('when combined with must-match and custom conditions', () => {
      const setupCombinedElement = () =>
        setupElement({
          ifDefined: 'author',
          ifNotDefined: 'thumbnail',
          mustMatch: {filetype: ['pdf']},
          conditions: [(result: Result) => result.title === 'Coveo'],
        });
      const matchingResult = {title: 'Coveo', raw: {author: 'Jane', filetype: 'pdf'}};

      it('should apply to a result that meets every condition', async () => {
        const element = await setupCombinedElement();
        expect(await appliesTo(element, matchingResult)).toBe(true);
      });

      it('should not apply to a result that does not meet if-defined', async () => {
        const element = await setupCombinedElement();
        expect(await appliesTo(element, {...matchingResult, raw: {filetype: 'pdf'}})).toBe(false);
      });

      it('should not apply to a result that does not meet if-not-defined', async () => {
        const element = await setupCombinedElement();
        const raw = {...matchingResult.raw, thumbnail: 'https://example.com/thumbnail.png'};
        expect(await appliesTo(element, {...matchingResult, raw})).toBe(false);
      });

      it('should not apply to a result that does not meet must-match', async () => {
        const element = await setupCombinedElement();
        const raw = {...matchingResult.raw, filetype: 'docx'};
        expect(await appliesTo(element, {...matchingResult, raw})).toBe(false);
      });

      it('should not apply to a result that does not meet a custom condition', async () => {
        const element = await setupCombinedElement();
        expect(await appliesTo(element, {...matchingResult, title: 'Other'})).toBe(false);
      });
    });
  });

  describe('#getTemplate', () => {
    it('should call getTemplate on the controller', async () => {
      const titleConditions = (result: Result) => result.title === 'Coveo';
      const fakeTemplate = {
        conditions: [],
        content: document.createDocumentFragment(),
        priority: 1,
      };
      const spy = vi
        .spyOn(ResultTemplateController.prototype, 'getTemplate')
        .mockResolvedValue(fakeTemplate);
      const element = await setupElement({conditions: [titleConditions]});
      const result = await element.getTemplate();

      expect(spy).toHaveBeenCalledWith([titleConditions]);
      expect(result).toBe(fakeTemplate);
      spy.mockRestore();
    });
  });

  it('should render nothing by default', async () => {
    const element = await setupElement();
    expect(sanitizeHtml(element.shadowRoot!.innerHTML)).toBe('');
  });

  it('should render an atomic-component-error if error is thrown', async () => {
    const mockedConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const container = await fixture(html`
      <div>
        <atomic-result-template>
          <template slot="default"><div>content</div></template>
        </atomic-result-template>
      </div>
    `);

    const element = container.querySelector('atomic-result-template') as AtomicResultTemplate;

    await element.updateComplete;

    const errorComponent = element.shadowRoot?.querySelector('atomic-component-error');
    expect(errorComponent).toBeDefined();
    mockedConsoleError.mockRestore();
  });
});
