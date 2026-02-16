import type {Result as RecsResult} from '@coveo/headless/recommendation';
import {ResultTemplatesHelpers} from '@coveo/headless/recommendation';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {RecsResultTemplateController} from '@/src/components/common/result-templates/recs-result-template-controller.js';
import {makeMatchConditions} from '@/src/components/common/template-controller/template-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {sanitizeHtml} from '@/vitest-utils/testing-helpers/testing-utils/sanitize-html';
import {AtomicRecsResultTemplate} from './atomic-recs-result-template.js';

vi.mock('@/src/components/common/template-controller/template-utils', {
  spy: true,
});

describe('atomic-recs-result-template', () => {
  type AtomicRecsResultTemplateProps = Pick<
    AtomicRecsResultTemplate,
    'conditions' | 'mustMatch' | 'mustNotMatch'
  >;

  const setupElement = async (
    options: Partial<AtomicRecsResultTemplateProps> = {}
  ) => {
    const defaultProps: AtomicRecsResultTemplateProps = {
      conditions: [],
      mustMatch: {},
      mustNotMatch: {},
    };

    const container = document.createElement('atomic-recs-list');
    const element = await fixture<AtomicRecsResultTemplate>(
      html`
        <atomic-recs-result-template
          .conditions=${options.conditions || defaultProps.conditions}
          .mustMatch=${options.mustMatch || defaultProps.mustMatch}
          .mustNotMatch=${options.mustNotMatch || defaultProps.mustNotMatch}
        >
          <template>
            <div>Result Template Content</div>
          </template>
        </atomic-recs-result-template>
      `,
      container
    );
    return element;
  };

  it('should instantiate without errors', async () => {
    const element = await setupElement();
    expect(element).toBeInstanceOf(AtomicRecsResultTemplate);
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

    it('should set matchConditions on RecsResultTemplateController with correct value', async () => {
      const mustMatch = {filetype: ['pdf']};
      const mustNotMatch = {source: ['spam']};
      const element = await setupElement({mustMatch, mustNotMatch});

      const expected = makeMatchConditions(
        mustMatch,
        mustNotMatch,
        ResultTemplatesHelpers
      );

      const template = await element.getTemplate();
      expect(template).not.toBeNull();
      expect(template!.conditions).toHaveLength(expected.length);
    });
  });

  describe('#getTemplate', () => {
    it('should call getTemplate on the controller', async () => {
      const titleConditions = (result: RecsResult) => result.title === 'Coveo';
      const fakeTemplate = {
        conditions: [],
        content: document.createDocumentFragment(),
        priority: 1,
      };
      const spy = vi
        .spyOn(RecsResultTemplateController.prototype, 'getTemplate')
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
    const mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const container = await fixture(html`
      <div>
        <atomic-recs-result-template>
          <template slot="default"><div>content</div></template>
        </atomic-recs-result-template>
      </div>
    `);

    const element = container.querySelector(
      'atomic-recs-result-template'
    ) as AtomicRecsResultTemplate;

    await element.updateComplete;

    const errorComponent = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorComponent).toBeDefined();
    mockedConsoleError.mockRestore();
  });
});
