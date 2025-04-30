import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {html, nothing, TemplateResult} from 'lit';
import {vi} from 'vitest';
import {AnyItem} from '../interface/item';
import {ItemRenderingFunction} from './item-list-common-lit';
import {
  renderTableData,
  renderTableLayout,
  renderTableRow,
  TableDataProps,
  TableLayoutProps,
  TableRowProps,
} from './table-layout';

describe('renderTableLayout', () => {
  const setupElement = async (
    props: Partial<TableLayoutProps>,
    children?: TemplateResult
  ) => {
    return await renderFunctionFixture(
      html`${renderTableLayout({
        props: {
          firstItem: buildFakeProduct(),
          itemRenderingFunction: props.itemRenderingFunction || undefined,
          templateContentForFirstItem:
            props.templateContentForFirstItem ||
            document.createDocumentFragment(),
          host: props.host || document.createElement('div'),
          listClasses: props.listClasses || '',
          logger: props.logger || console,
        },
      })(children || nothing)}`
    );
  };

  beforeEach(() => {
    fixtureCleanup();
  });

  test('should render 1 table element', async () => {
    const element = await setupElement({});

    const renderedElements = element.querySelectorAll('table');

    expect(renderedElements.length).toBe(1);
  });

  test('should render table element with correct class', async () => {
    const listClasses = 'test-class';
    const element = await setupElement({listClasses});

    const renderedTableElement = element.querySelector('table');

    expect(renderedTableElement?.classList).toContain(listClasses);
  });

  test('should render table element with correct part', async () => {
    const element = await setupElement({});

    const renderedTableElement = element.querySelector('table');

    expect(renderedTableElement?.part.contains('result-table')).toBe(true);
  });

  test('should render 1 thead element', async () => {
    const element = await setupElement({});

    const renderedTheadElements = element.querySelectorAll('thead');

    expect(renderedTheadElements.length).toBe(1);
  });

  test('should render thead element with correct part', async () => {
    const element = await setupElement({});

    const renderedTheadElement = element.querySelector('thead');

    expect(renderedTheadElement?.part.contains('result-table-heading')).toBe(
      true
    );
  });

  test('should render 1 tr element', async () => {
    const element = await setupElement({});

    const renderedTrElements = element.querySelectorAll('tr');

    expect(renderedTrElements.length).toBe(1);
  });

  test('should render tr element with correct part', async () => {
    const element = await setupElement({});

    const renderedTrElement = element.querySelector('tr');

    expect(renderedTrElement?.part.contains('result-table-heading-row')).toBe(
      true
    );
  });

  test('should render 1 tbody element', async () => {
    const element = await setupElement({});

    const renderedTbodyElements = element.querySelectorAll('tbody');

    expect(renderedTbodyElements.length).toBe(1);
  });

  test('should render tbody element with correct part', async () => {
    const element = await setupElement({});

    const renderedTbodyElement = element.querySelector('tbody');

    expect(renderedTbodyElement?.part.contains('result-table-body')).toBe(true);
  });

  test('should render children under tbody element', async () => {
    const children = html`<div class="test-child"></div>`;
    const element = await setupElement({}, children);

    const renderedChildren = element?.querySelectorAll('.test-child');
    const renderedTbodyElement = element.querySelector('tbody');

    expect(renderedChildren).toBeTruthy();
    expect(renderedChildren?.[0]?.parentElement).toBe(renderedTbodyElement);
  });

  describe('when #itemRenderingFunction is defined', () => {
    let itemRenderingFunction: ItemRenderingFunction;
    beforeEach(() => {
      itemRenderingFunction = (_item: AnyItem) =>
        `<atomic-table-element label='itemRenderingFunction_label1'></atomic-table-element>
      <atomic-table-element label='itemRenderingFunction_label2'></atomic-table-element>`;
    });

    test('when #itemRenderingFunction returns no atomic-table-element, should log error', async () => {
      const host = document.createElement('div');
      itemRenderingFunction = () => '';
      const logger = {
        error: vi.fn(),
      };

      await setupElement({
        host,
        itemRenderingFunction,
        logger,
      });

      expect(logger.error).toHaveBeenCalledWith(
        'atomic-table-element elements missing in the template to display columns.',
        host
      );
    });

    test('should render 1 th element per atomic-table-element returned by #itemRenderingFunction', async () => {
      const element = await setupElement({
        itemRenderingFunction,
      });

      const renderedThElements = element.querySelectorAll('th');

      expect(renderedThElements.length).toBe(2);
    });

    test('each th element should have correct part', async () => {
      const element = await setupElement({
        itemRenderingFunction,
      });

      const renderedThElements = element.querySelectorAll('th');

      expect(
        renderedThElements?.[0].part.contains('result-table-heading-cell')
      ).toBe(true);

      expect(
        renderedThElements?.[1].part.contains('result-table-heading-cell')
      ).toBe(true);
    });

    test('should render 1 atomic-text element per atomic-table-element return by #itemRenderingFunction', async () => {
      const element = await setupElement({
        itemRenderingFunction,
      });

      const renderedTextElements = element.querySelectorAll('atomic-text');

      expect(renderedTextElements.length).toBe(2);
    });

    test('each atomic-text element should have corresponding atomic-table-element label as its #value', async () => {
      const element = await setupElement({
        itemRenderingFunction,
      });

      const renderedTextElements = element.querySelectorAll('atomic-text');

      expect(renderedTextElements?.[0].value).toBe(
        'itemRenderingFunction_label1'
      );
      expect(renderedTextElements?.[1].value).toBe(
        'itemRenderingFunction_label2'
      );
    });
  });

  describe('when #itemRenderingFunction is not defined', () => {
    let templateContentForFirstItem: DocumentFragment;

    beforeEach(() => {
      templateContentForFirstItem = document.createDocumentFragment();
      const tableElement1 = document.createElement('atomic-table-element');
      tableElement1.setAttribute('label', 'templateContentForFirstItem_label1');
      const tableElement2 = document.createElement('atomic-table-element');
      tableElement2.setAttribute('label', 'templateContentForFirstItem_label2');
      templateContentForFirstItem.appendChild(tableElement1);
      templateContentForFirstItem.appendChild(tableElement2);
    });

    test('when #templateContentForFirstItem contains no atomic-table-element, should log error', async () => {
      const host = document.createElement('div');
      const logger = {
        error: vi.fn(),
      };
      templateContentForFirstItem = document.createDocumentFragment();

      await setupElement({
        host,
        logger,
        templateContentForFirstItem,
      });

      expect(logger.error).toHaveBeenCalledWith(
        'atomic-table-element elements missing in the template to display columns.',
        host
      );
    });

    test('should render 1 th element per atomic-table-element in #templateContentForFirstItem', async () => {
      const element = await setupElement({
        templateContentForFirstItem,
      });

      const renderedThElements = element.querySelectorAll('th');

      expect(renderedThElements.length).toBe(2);
    });

    test('each th element should have correct part', async () => {
      const element = await setupElement({
        templateContentForFirstItem,
      });

      const renderedThElements = element.querySelectorAll('th');

      expect(
        renderedThElements?.[0].part.contains('result-table-heading-cell')
      ).toBe(true);

      expect(
        renderedThElements?.[1].part.contains('result-table-heading-cell')
      ).toBe(true);
    });

    test('should render 1 atomic-text element per atomic-table-element in #templateContentForFirstItem', async () => {
      const element = await setupElement({
        templateContentForFirstItem,
      });

      const renderedTextElements = element.querySelectorAll('atomic-text');

      expect(renderedTextElements.length).toBe(2);
    });

    test('each atomic-text element should have corresponding atomic-table-element label as its #value', async () => {
      const element = await setupElement({
        templateContentForFirstItem,
      });

      const renderedTextElements = element.querySelectorAll('atomic-text');

      expect(renderedTextElements?.[0].value).toBe(
        'templateContentForFirstItem_label1'
      );
      expect(renderedTextElements?.[1].value).toBe(
        'templateContentForFirstItem_label2'
      );
    });
  });
});

describe('renderTableRow', () => {
  const setupElement = async (
    props: Partial<TableRowProps>,
    children?: TemplateResult
  ) => {
    return await renderFunctionFixture(
      html`${renderTableRow({
        props: {
          key: props.key || 'key',
          rowIndex: props.rowIndex || 0,
          setRef: props.setRef || (() => {}),
        },
      })(children || nothing)}`
    );
  };

  beforeEach(() => {
    fixtureCleanup();
  });

  test('should render 1 tr element', async () => {
    const element = await setupElement({});

    const renderedElements = element.querySelectorAll('*');

    expect(renderedElements.length).toBe(1);
    expect(renderedElements[0].tagName).toBe('TR');
  });

  test('when #rowIndex is even, should render with correct part', async () => {
    const element = await setupElement({rowIndex: 0});

    const renderedElement = element.querySelector('tr');

    expect(renderedElement?.part.contains('result-table-row')).toBe(true);

    // Logic is reversed because #rowIndex is 0-based, so #rowIndex 0 is actually the 1st row in the rendered table.
    expect(renderedElement?.part.contains('result-table-row-even')).toBe(false);
    expect(renderedElement?.part.contains('result-table-row-odd')).toBe(true);
  });

  test('when #rowIndex is odd, should render with correct part', async () => {
    const element = await setupElement({rowIndex: 1});

    const renderedElement = element.querySelector('tr');

    expect(renderedElement?.part.contains('result-table-row')).toBe(true);

    // Logic is reversed because #rowIndex is 0-based, sor #rowIndex 1 is actually the 2nd row in the rendered table.
    expect(renderedElement?.part.contains('result-table-row-even')).toBe(true);
    expect(renderedElement?.part.contains('result-table-row-odd')).toBe(false);
  });

  test('should call #setRef with the rendered element', async () => {
    const setRef = vi.fn();
    const element = await setupElement({setRef});

    const renderedElement = element.querySelector('tr');

    expect(setRef).toHaveBeenCalledWith(renderedElement);
  });

  test('should render children', async () => {
    const children = html`<div class="test-child"></div>`;
    const element = await setupElement({}, children);

    const renderedChildren = element?.querySelectorAll('.test-child');
    const renderedElement = element.querySelector('tr');

    expect(renderedChildren).toBeTruthy();
    expect(renderedChildren?.[0]?.parentElement).toBe(renderedElement);
  });
});

describe('renderTableData', () => {
  const setupElement = async (props: Partial<TableDataProps>) => {
    return await renderFunctionFixture(
      html`${renderTableData({
        props: {
          firstItem: props.firstItem || buildFakeProduct(),
          itemRenderingFunction: props.itemRenderingFunction || undefined,
          key: props.key || 'key',
          renderItem: props.renderItem || (() => html``),
          templateContentForFirstItem:
            props.templateContentForFirstItem ||
            document.createDocumentFragment(),
        },
      })}`
    );
  };

  beforeEach(() => {
    fixtureCleanup();
  });

  describe('when #itemRenderingFunction is defined', () => {
    let itemRenderingFunction: ItemRenderingFunction;
    beforeEach(() => {
      itemRenderingFunction = (_item: AnyItem) =>
        `<atomic-table-element label='itemRenderingFunction_label1'></atomic-table-element>
      <atomic-table-element label='itemRenderingFunction_label2'></atomic-table-element>`;
    });

    test('should render 1 td element per atomic-table-element returned by #itemRenderingFunction', async () => {
      const element = await setupElement({
        itemRenderingFunction,
      });

      const renderedThElements = element.querySelectorAll('td');

      expect(renderedThElements.length).toBe(2);
    });

    test('each td element should have correct part', async () => {
      const element = await setupElement({
        itemRenderingFunction,
      });

      const renderedTdElements = element.querySelectorAll('td');

      expect(renderedTdElements?.[0].part.contains('result-table-cell')).toBe(
        true
      );

      expect(renderedTdElements?.[1].part.contains('result-table-cell')).toBe(
        true
      );
    });

    test('should call #renderItem with corresponding atomic-table-element for each column to render', async () => {
      const renderItem = vi.fn();
      await setupElement({
        itemRenderingFunction,
        renderItem,
      });

      const tableElement1 = document.createElement('atomic-table-element');
      tableElement1.setAttribute('label', 'itemRenderingFunction_label1');

      const tableElement2 = document.createElement('atomic-table-element');
      tableElement2.setAttribute('label', 'itemRenderingFunction_label2');

      expect(renderItem).toHaveBeenCalledTimes(2);
      expect(renderItem.mock.calls[0][0]).toEqual(tableElement1);
      expect(renderItem.mock.calls[1][0]).toEqual(tableElement2);
    });
  });

  describe('when #itemRenderingFunction is not defined', () => {
    let templateContentForFirstItem: DocumentFragment;
    let tableElement1: Element;
    let tableElement2: Element;

    beforeEach(() => {
      templateContentForFirstItem = document.createDocumentFragment();
      tableElement1 = document.createElement('atomic-table-element');
      tableElement1.setAttribute('label', 'templateContentForFirstItem_label1');
      tableElement2 = document.createElement('atomic-table-element');
      tableElement2.setAttribute('label', 'templateContentForFirstItem_label2');
      templateContentForFirstItem.appendChild(tableElement1);
      templateContentForFirstItem.appendChild(tableElement2);
    });
    test('should render 1 td element per atomic-table-element returned by #itemRenderingFunction', async () => {
      const element = await setupElement({
        templateContentForFirstItem,
      });

      const renderedThElements = element.querySelectorAll('td');

      expect(renderedThElements.length).toBe(2);
    });

    test('each td element should have correct part', async () => {
      const element = await setupElement({
        templateContentForFirstItem,
      });

      const renderedTdElements = element.querySelectorAll('td');

      expect(renderedTdElements?.[0].part.contains('result-table-cell')).toBe(
        true
      );

      expect(renderedTdElements?.[1].part.contains('result-table-cell')).toBe(
        true
      );
    });

    test('should call #renderItem with corresponding atomic-table-element for each column to render', async () => {
      const renderItem = vi.fn();
      await setupElement({
        templateContentForFirstItem,
        renderItem,
      });

      expect(renderItem).toHaveBeenCalledTimes(2);
      expect(renderItem.mock.calls[0][0]).toBe(tableElement1);
      expect(renderItem.mock.calls[1][0]).toBe(tableElement2);
    });
  });
});
