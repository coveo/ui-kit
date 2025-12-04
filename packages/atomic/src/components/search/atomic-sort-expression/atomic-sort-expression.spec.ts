import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicSortExpression} from './atomic-sort-expression';
import './atomic-sort-expression';

describe('atomic-sort-expression', () => {
  const renderSortExpression = async ({
    label = 'Test Label',
    expression = 'relevancy',
    tabsIncluded = [],
    tabsExcluded = [],
    insideDropdown = true,
  }: {
    label?: string;
    expression?: string;
    tabsIncluded?: string[];
    tabsExcluded?: string[];
    insideDropdown?: boolean;
  } = {}) => {
    const template = html`<atomic-sort-expression
      label="${label}"
      expression="${expression}"
      tabs-included="${JSON.stringify(tabsIncluded)}"
      tabs-excluded="${JSON.stringify(tabsExcluded)}"
    ></atomic-sort-expression>`;

    const element = insideDropdown
      ? await fixture<AtomicSortExpression>(html`
          <atomic-sort-dropdown>${template}</atomic-sort-dropdown>
        `)
      : await fixture<AtomicSortExpression>(template);

    return {
      element: insideDropdown
        ? (element.querySelector(
            'atomic-sort-expression'
          ) as AtomicSortExpression)
        : element,
    };
  };

  describe('when rendering with valid props', () => {
    it('should render successfully with required props', async () => {
      const {element} = await renderSortExpression();
      expect(element).toBeInTheDocument();
    });

    it('should render successfully with all props', async () => {
      const {element} = await renderSortExpression({
        label: 'Date Ascending',
        expression: 'date ascending',
        tabsIncluded: ['tab1', 'tab2'],
      });
      expect(element).toBeInTheDocument();
    });

    it('should reflect label property to attribute', async () => {
      const {element} = await renderSortExpression({label: 'Custom Label'});
      expect(element.getAttribute('label')).toBe('Custom Label');
    });

    it('should reflect expression property to attribute', async () => {
      const {element} = await renderSortExpression({
        expression: 'date descending',
      });
      expect(element.getAttribute('expression')).toBe('date descending');
    });

    it('should allow updating properties', async () => {
      const {element} = await renderSortExpression();

      element.label = 'Updated Label';
      element.expression = 'date ascending';
      await element.updateComplete;

      expect(element.label).toBe('Updated Label');
      expect(element.expression).toBe('date ascending');
    });
  });

  describe('when rendering with tabs-included', () => {
    it('should parse tabs-included as array', async () => {
      const {element} = await renderSortExpression({
        tabsIncluded: ['tab1', 'tab2', 'tab3'],
      });
      expect(element.tabsIncluded).toEqual(['tab1', 'tab2', 'tab3']);
    });

    it('should default to empty array when tabs-included is not set', async () => {
      const {element} = await renderSortExpression();
      expect(element.tabsIncluded).toEqual([]);
    });

    it('should reflect tabs-included property to attribute', async () => {
      const {element} = await renderSortExpression({
        tabsIncluded: ['tab1', 'tab2'],
      });
      const attribute = element.getAttribute('tabs-included');
      expect(JSON.parse(attribute || '[]')).toEqual(['tab1', 'tab2']);
    });
  });

  describe('when rendering with tabs-excluded', () => {
    it('should parse tabs-excluded as array', async () => {
      const {element} = await renderSortExpression({
        tabsExcluded: ['excludeTab1', 'excludeTab2'],
      });
      expect(element.tabsExcluded).toEqual(['excludeTab1', 'excludeTab2']);
    });

    it('should default to empty array when tabs-excluded is not set', async () => {
      const {element} = await renderSortExpression();
      expect(element.tabsExcluded).toEqual([]);
    });

    it('should reflect tabs-excluded property to attribute', async () => {
      const {element} = await renderSortExpression({
        tabsExcluded: ['tab1', 'tab2'],
      });
      const attribute = element.getAttribute('tabs-excluded');
      expect(JSON.parse(attribute || '[]')).toEqual(['tab1', 'tab2']);
    });
  });

  describe('when both tabs-included and tabs-excluded are set', () => {
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should log a warning', async () => {
      await renderSortExpression({
        tabsIncluded: ['tab1'],
        tabsExcluded: ['tab2'],
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Values for both "tabs-included" and "tabs-excluded" have been provided. This could lead to unexpected behaviors.'
      );
    });

    it('should still render the component', async () => {
      const {element} = await renderSortExpression({
        tabsIncluded: ['tab1'],
        tabsExcluded: ['tab2'],
      });
      expect(element).toBeInTheDocument();
    });
  });

  describe('when not inside atomic-sort-dropdown', () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should render an error component', async () => {
      const {element} = await renderSortExpression({insideDropdown: false});
      await element.updateComplete;

      const errorComponent = element.querySelector('atomic-component-error');
      expect(errorComponent).toBeInTheDocument();
    });

    it('should log an error to console', async () => {
      const {element} = await renderSortExpression({insideDropdown: false});
      await element.updateComplete;

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include correct error message', async () => {
      const {element} = await renderSortExpression({insideDropdown: false});
      await element.updateComplete;

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        new Error(
          'The \"atomic-sort-expression\" component has to be used inside an atomic-sort-dropdown element.'
        ),
        expect.anything()
      );
    });
  });

  describe('when inside atomic-sort-dropdown', () => {
    it('should render successfully', async () => {
      const {element} = await renderSortExpression({insideDropdown: true});
      expect(element).toBeInTheDocument();
    });

    it('should not render an error component', async () => {
      const {element} = await renderSortExpression({insideDropdown: true});
      await element.updateComplete;

      const errorComponent = element.querySelector('atomic-component-error');
      expect(errorComponent).not.toBeInTheDocument();
    });
  });

  describe('when rendering slots', () => {
    it('should render default slot content', async () => {
      const element = await fixture<HTMLElement>(html`
        <atomic-sort-dropdown>
          <atomic-sort-expression label="Test" expression="relevancy">
            <div id="slot-content">Slot Content</div>
          </atomic-sort-expression>
        </atomic-sort-dropdown>
      `);

      const sortExpression = element.querySelector('atomic-sort-expression');
      const slotContent = sortExpression?.querySelector('#slot-content');
      expect(slotContent).toBeInTheDocument();
      expect(slotContent?.textContent).toBe('Slot Content');
    });
  });

  // TODO V4: KIT-5197 - Remove skip
  it.skip.each<{
    prop: 'label' | 'expression' | 'tabsIncluded';
    invalidValue: string | number | unknown[];
  }>([
    {
      prop: 'label',
      invalidValue: '',
    },
    {
      prop: 'expression',
      invalidValue: '',
    },
    {
      prop: 'tabsIncluded',
      invalidValue: ['invalid', 123, null],
    },
  ])(
    'should set error when #$prop is invalid',
    async ({prop, invalidValue}) => {
      const {element} = await renderSortExpression();

      expect(element.error).toBeUndefined();

      // biome-ignore lint/suspicious/noExplicitAny: testing invalid values
      (element as any)[prop] = invalidValue;
      await element.updateComplete;

      expect(element.error).toBeDefined();
      expect(element.error.message).toMatch(new RegExp(prop, 'i'));
    }
  );
});
