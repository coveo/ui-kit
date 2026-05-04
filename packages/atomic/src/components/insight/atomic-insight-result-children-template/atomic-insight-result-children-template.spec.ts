import type {Result as InsightResult} from '@coveo/headless/insight';
import {ResultTemplatesHelpers as InsightResultTemplatesHelpers} from '@coveo/headless/insight';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {ResultTemplateController} from '@/src/components/common/result-templates/result-template-controller.js';
import {
  makeDefinedConditions,
  makeMatchConditions,
} from '@/src/components/common/template-controller/template-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {sanitizeHtml} from '@/vitest-utils/testing-helpers/testing-utils/sanitize-html';
import {AtomicInsightResultChildrenTemplate} from './atomic-insight-result-children-template.js';

vi.mock('@coveo/headless/insight', {spy: true});
vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});

describe('atomic-insight-result-children-template', () => {
  type AtomicInsightResultChildrenTemplateProps = Pick<
    AtomicInsightResultChildrenTemplate,
    'conditions' | 'mustMatch' | 'mustNotMatch'
  >;

  interface SetupOptions extends Partial<AtomicInsightResultChildrenTemplateProps> {
    ifDefined?: string;
    ifNotDefined?: string;
  }

  const setupElement = async (options: SetupOptions = {}) => {
    const defaultProps: AtomicInsightResultChildrenTemplateProps = {
      conditions: [],
      mustMatch: {},
      mustNotMatch: {},
    };

    const container = document.createElement('atomic-insight-result-children');
    const element = await fixture<AtomicInsightResultChildrenTemplate>(
      html`
        <atomic-insight-result-children-template
          .conditions=${options.conditions || defaultProps.conditions}
          .mustMatch=${options.mustMatch || defaultProps.mustMatch}
          .mustNotMatch=${options.mustNotMatch || defaultProps.mustNotMatch}
          if-defined=${options.ifDefined ?? ''}
          if-not-defined=${options.ifNotDefined ?? ''}
        >
          <template>
            <div>Result Template Content</div>
          </template>
        </atomic-insight-result-children-template>
      `,
      container
    );
    return element;
  };

  it('should instantiate without errors', async () => {
    const element = await setupElement();
    expect(element).toBeInstanceOf(AtomicInsightResultChildrenTemplate);
  });

  it('should have default empty mustMatch, mustNotMatch, and conditions', async () => {
    const element = await setupElement();
    expect(element.mustMatch).toEqual({});
    expect(element.mustNotMatch).toEqual({});
    expect(element.conditions).toEqual([]);
  });

  describe('when added to the DOM (#connectedCallback)', () => {
    it('should call #makeMatchConditions with the correct arguments', async () => {
      const mockMakeMatchConditions = vi.mocked(makeMatchConditions);
      await setupElement({
        mustMatch: {filetype: ['pdf']},
        mustNotMatch: {source: ['spam']},
      });
      expect(mockMakeMatchConditions).toHaveBeenCalledExactlyOnceWith(
        {filetype: ['pdf']},
        {source: ['spam']},
        InsightResultTemplatesHelpers
      );
    });

    it('should call #makeDefinedConditions with the correct arguments', async () => {
      const mockMakeDefinedConditions = vi.mocked(makeDefinedConditions);
      await setupElement({
        ifDefined: 'filetype,sourcetype',
        ifNotDefined: 'author',
      });
      expect(mockMakeDefinedConditions).toHaveBeenCalledExactlyOnceWith(
        'filetype,sourcetype',
        'author',
        InsightResultTemplatesHelpers
      );
    });

    it('should set matchConditions on ResultTemplateController with correct value', async () => {
      const mustMatch = {filetype: ['pdf']};
      const mustNotMatch = {source: ['spam']};
      const element = await setupElement({mustMatch, mustNotMatch});

      const expected = makeMatchConditions(
        mustMatch,
        mustNotMatch,
        InsightResultTemplatesHelpers
      );

      const template = await element.getTemplate();
      expect(template).not.toBeNull();
      expect(template!.conditions).toHaveLength(expected.length);
      for (const condition of template!.conditions) {
        expect(condition).toBeTypeOf('function');
      }
    });

    it('should include defined conditions in template conditions when if-defined is set', async () => {
      const element = await setupElement({ifDefined: 'filetype'});
      const template = await element.getTemplate();

      expect(template).not.toBeNull();
      expect(template!.conditions.length).toBeGreaterThanOrEqual(1);

      const definedConditions = makeDefinedConditions(
        'filetype',
        undefined,
        InsightResultTemplatesHelpers
      );
      expect(template!.conditions).toHaveLength(definedConditions.length);
    });

    it('should include defined conditions in template conditions when if-not-defined is set', async () => {
      const element = await setupElement({ifNotDefined: 'author'});
      const template = await element.getTemplate();

      expect(template).not.toBeNull();
      expect(template!.conditions.length).toBeGreaterThanOrEqual(1);

      const definedConditions = makeDefinedConditions(
        undefined,
        'author',
        InsightResultTemplatesHelpers
      );
      expect(template!.conditions).toHaveLength(definedConditions.length);
    });

    it('should combine if-defined, if-not-defined, and custom conditions', async () => {
      const customCondition = (result: InsightResult) =>
        result.title === 'Coveo';
      const element = await setupElement({
        ifDefined: 'filetype',
        ifNotDefined: 'author',
        conditions: [customCondition],
      });
      const template = await element.getTemplate();

      expect(template).not.toBeNull();

      const definedConditions = makeDefinedConditions(
        'filetype',
        'author',
        InsightResultTemplatesHelpers
      );
      // 1 custom + defined conditions from ifDefined + ifNotDefined
      expect(template!.conditions).toHaveLength(1 + definedConditions.length);
    });
  });

  describe('#getTemplate', () => {
    it('should call getTemplate on the controller', async () => {
      const titleConditions = (result: InsightResult) =>
        result.title === 'Coveo';
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
    const mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const container = await fixture(html`
      <div>
        <atomic-insight-result-children-template>
          <template slot="default"><div>content</div></template>
        </atomic-insight-result-children-template>
      </div>
    `);

    const element = container.querySelector(
      'atomic-insight-result-children-template'
    ) as AtomicInsightResultChildrenTemplate;

    await element.updateComplete;

    const errorComponent = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorComponent).not.toBeNull();
    mockedConsoleError.mockRestore();
  });
});
