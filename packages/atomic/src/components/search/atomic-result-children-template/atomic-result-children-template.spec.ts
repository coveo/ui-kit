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
import {AtomicResultChildrenTemplate} from './atomic-result-children-template.js';

vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});

describe('atomic-result-children-template', () => {
  type AtomicResultChildrenTemplateProps = Pick<
    AtomicResultChildrenTemplate,
    'conditions' | 'mustMatch' | 'mustNotMatch' | 'ifDefined' | 'ifNotDefined'
  >;

  const setupElement = async (options: Partial<AtomicResultChildrenTemplateProps> = {}) => {
    const defaultProps: AtomicResultChildrenTemplateProps = {
      conditions: [],
      mustMatch: {},
      mustNotMatch: {},
    };

    const container = document.createElement('atomic-result-children');
    const element = await fixture<AtomicResultChildrenTemplate>(
      html`
        <atomic-result-children-template
          .conditions=${options.conditions || defaultProps.conditions}
          .mustMatch=${options.mustMatch || defaultProps.mustMatch}
          .mustNotMatch=${options.mustNotMatch || defaultProps.mustNotMatch}
          if-defined=${ifDefined(options.ifDefined)}
          if-not-defined=${ifDefined(options.ifNotDefined)}
        >
          <template>
            <div>Child Result Template Content</div>
          </template>
        </atomic-result-children-template>
      `,
      container
    );
    return element;
  };

  it('should instantiate without errors', async () => {
    const element = await setupElement();
    expect(element).toBeInstanceOf(AtomicResultChildrenTemplate);
  });

  it('should have default empty mustMatch, mustNotMatch, and conditions', async () => {
    const element = await setupElement();
    expect(element.mustMatch).toEqual({});
    expect(element.mustNotMatch).toEqual({});
    expect(element.conditions).toEqual([]);
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

      const fakeTemplate = {
        conditions: expected,
        content: document.createDocumentFragment(),
        priority: 1,
      };
      const spy = vi
        .spyOn(ResultTemplateController.prototype, 'getTemplate')
        .mockReturnValue(fakeTemplate);

      const template = await element.getTemplate();
      expect(template).not.toBeNull();
      expect(template!.conditions).toHaveLength(expected.length);
      spy.mockRestore();
    });
  });

  describe('when #ifDefined or #ifNotDefined is set', () => {
    const appliesTo = async (
      element: AtomicResultChildrenTemplate,
      resultState: Parameters<typeof buildFakeResult>[0]
    ) => {
      const template = await element.getTemplate();
      const result = buildFakeResult(resultState);
      return template!.conditions.every((condition) => condition(result));
    };

    it('should map the if-defined and if-not-defined attributes to ifDefined and ifNotDefined', async () => {
      const element = await setupElement({ifDefined: 'author,date', ifNotDefined: 'thumbnail'});
      expect(element.ifDefined).toBe('author,date');
      expect(element.ifNotDefined).toBe('thumbnail');
    });

    it('should apply only to child results that define every field of if-defined', async () => {
      const element = await setupElement({ifDefined: 'author,date'});
      expect(await appliesTo(element, {raw: {author: 'Jane', date: 1}})).toBe(true);
      expect(await appliesTo(element, {raw: {author: 'Jane'}})).toBe(false);
    });

    it('should apply only to child results that define none of the fields of if-not-defined', async () => {
      const element = await setupElement({ifNotDefined: 'author,date'});
      expect(await appliesTo(element, {raw: {source: 'Coveo'}})).toBe(true);
      expect(await appliesTo(element, {raw: {date: 1}})).toBe(false);
    });

    it('should apply only when the defined, must-match and custom conditions are all met', async () => {
      const element = await setupElement({
        ifDefined: 'author',
        ifNotDefined: 'thumbnail',
        mustMatch: {filetype: ['pdf']},
        conditions: [(result: Result) => result.title === 'Coveo'],
      });
      const raw = {author: 'Jane', filetype: 'pdf'};

      expect(await appliesTo(element, {title: 'Coveo', raw})).toBe(true);
      expect(await appliesTo(element, {title: 'Coveo', raw: {filetype: 'pdf'}})).toBe(false);
      expect(await appliesTo(element, {title: 'Coveo', raw: {...raw, thumbnail: 'x.png'}})).toBe(
        false
      );
      expect(await appliesTo(element, {title: 'Coveo', raw: {...raw, filetype: 'docx'}})).toBe(
        false
      );
      expect(await appliesTo(element, {title: 'Other', raw})).toBe(false);
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
        .mockReturnValue(fakeTemplate);
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
        <atomic-result-children-template>
          <template slot="default"><div>content</div></template>
        </atomic-result-children-template>
      </div>
    `);

    const element = container.querySelector(
      'atomic-result-children-template'
    ) as AtomicResultChildrenTemplate;

    await element.updateComplete;

    const errorComponent = element.shadowRoot?.querySelector('atomic-component-error');
    expect(errorComponent).not.toBeNull();
    mockedConsoleError.mockRestore();
  });
});
