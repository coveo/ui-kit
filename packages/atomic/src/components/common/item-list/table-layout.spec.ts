import {html, nothing, type TemplateResult} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {
  fixture,
  renderFunctionFixture,
} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {
  renderTableData,
  renderTableLayout,
  renderTableRow,
  type TableDataProps,
  type TableLayoutProps,
  type TableRowProps,
} from './table-layout';
import type {AnyItem} from './unfolded-item';

describe('renderTableLayout', () => {
  const tableLayoutFixture = async (
    props: Partial<TableLayoutProps> = {},
    children: TemplateResult | typeof nothing = nothing
  ) => {
    return await fixture(
      html`${renderTableLayout({
        props: {
          firstItem: buildFakeProduct(),
          itemRenderingFunction: undefined,
          templateContentForFirstItem: document.createDocumentFragment(),
          host: document.createElement('div'),
          listClasses: '',
          logger: {
            error: vi.fn(),
          },
          ...props,
        },
      })(children)}`
    );
  };

  it('should render a table element in the document', async () => {
    const tableLayout = await tableLayoutFixture();

    expect(tableLayout).toBeInTheDocument();
    expect(tableLayout.tagName).toBe('TABLE');
  });

  it("should apply the #listClasses prop value to the table element's 'class' attribute", async () => {
    const tableLayout = await tableLayoutFixture({
      listClasses: 'test-class-1 test-class-2',
    });

    expect(tableLayout).toHaveClass('test-class-1');
    expect(tableLayout).toHaveClass('test-class-2');
  });

  it('should render the table element with the correct part', async () => {
    const tableLayout = await tableLayoutFixture();

    expect(tableLayout.part.value).toBe('result-table');
  });

  it('should render a thead element under the table element', async () => {
    const tableLayout = await tableLayoutFixture();

    const theadElements = tableLayout.querySelectorAll('thead');

    expect(theadElements.length).toBe(1);
    expect(theadElements.item(0)).toBeInTheDocument();
    expect(theadElements.item(0).parentElement).toBe(tableLayout);
  });

  it('should render the thead element with the correct part', async () => {
    const tableLayout = await tableLayoutFixture();

    const theadElement = tableLayout.querySelector('thead');

    expect(theadElement?.part.value).toBe('result-table-heading');
  });

  it('should render a tr element under the thead element', async () => {
    const tableLayout = await tableLayoutFixture();

    const trElements = tableLayout.querySelectorAll('tr');

    expect(trElements.length).toBe(1);
    expect(trElements.item(0)).toBeInTheDocument();
    expect(trElements.item(0).parentElement?.nodeName).toBe('THEAD');
  });

  it('should render the tr element with the correct part', async () => {
    const tableLayout = await tableLayoutFixture();

    const trElement = tableLayout.querySelector('tr');

    expect(trElement?.part.value).toBe('result-table-heading-row');
  });

  it('should render a tbody element under the table element', async () => {
    const tableLayout = await tableLayoutFixture();

    const tBodyElements = tableLayout.querySelectorAll('tbody');

    expect(tBodyElements.length).toBe(1);
    expect(tBodyElements.item(0)).toBeInTheDocument();
    expect(tBodyElements.item(0).parentElement).toBe(tableLayout);
  });

  it('should render the tbody element with the correct part', async () => {
    const tableLayout = await tableLayoutFixture();

    const tBodyElement = tableLayout.querySelector('tbody');

    expect(tBodyElement?.part.value).toBe('result-table-body');
  });

  it('should render its children under the tbody element', async () => {
    const tableLayout = await tableLayoutFixture(
      {},
      html`<div class="child">Test Child 1</div>
        <div class="child">Test Child 2</div>`
    );

    const childElements = tableLayout?.querySelectorAll('.child');
    const tBodyElement = tableLayout.querySelector('tbody');

    expect(childElements.length).toBe(2);
    expect(childElements.item(0)).toBeInTheDocument();
    expect(childElements.item(0).parentElement).toBe(tBodyElement);
    expect(childElements.item(0).textContent).toBe('Test Child 1');
    expect(childElements.item(1)).toBeInTheDocument();
    expect(childElements.item(1).parentElement).toBe(tBodyElement);
    expect(childElements.item(1).textContent).toBe('Test Child 2');
  });

  describe('when the #itemRenderingFunction prop is defined', () => {
    const itemRenderingFunction = (_item: AnyItem) =>
      `
    <atomic-table-element label='Test Label 1'>
    </atomic-table-element>
    <atomic-table-element label='Test Label 2'>
    </atomic-table-element>`.trim();

    it('should log an error when calling #itemRenderingFunction returns no atomic-table-element', async () => {
      const host = document.createElement('div');
      const logger = {
        error: vi.fn(),
      };

      await tableLayoutFixture({
        host,
        itemRenderingFunction: () => '',
        logger,
      });

      expect(logger.error).toHaveBeenCalledWith(
        'atomic-table-element elements missing in the template to display columns.',
        host
      );
    });

    it('should render one th element under the tr element for each atomic-table-element returned by #itemRenderingFunction', async () => {
      const tableLayout = await tableLayoutFixture({itemRenderingFunction});

      const thElements = tableLayout.querySelectorAll('th');

      expect(thElements.length).toBe(2);
      expect(thElements.item(0)).toBeInTheDocument();
      expect(thElements.item(0).parentElement?.nodeName).toBe('TR');
      expect(thElements.item(1)).toBeInTheDocument();
      expect(thElements.item(1).parentElement?.nodeName).toBe('TR');
    });

    it('should render every th element with the correct part', async () => {
      const tableLayout = await tableLayoutFixture({
        itemRenderingFunction,
      });

      const thElements = tableLayout.querySelectorAll('th');

      expect(thElements?.[0].part.value).toBe('result-table-heading-cell');
      expect(thElements?.[1].part.value).toBe('result-table-heading-cell');
    });

    it('should render one atomic-text element under each th element', async () => {
      const tableLayout = await tableLayoutFixture({itemRenderingFunction});

      const atomicTextElements = tableLayout.querySelectorAll('atomic-text');

      expect(atomicTextElements.length).toBe(2);
      expect(atomicTextElements.item(0)).toBeInTheDocument();
      expect(atomicTextElements.item(0).parentElement?.nodeName).toBe('TH');
      expect(atomicTextElements.item(1)).toBeInTheDocument();
      expect(atomicTextElements.item(1).parentElement?.nodeName).toBe('TH');
    });

    it("should apply the corresponding atomic-table-element's 'label' attribute value to each atomic-text element's 'value' attribute", async () => {
      const tableLayout = await tableLayoutFixture({itemRenderingFunction});

      const atomicTextElements = tableLayout.querySelectorAll('atomic-text');

      expect(atomicTextElements?.[0].value).toBe('Test Label 1');
      expect(atomicTextElements?.[1].value).toBe('Test Label 2');
    });
  });

  describe('when the #itemRenderingFunction prop is not defined', () => {
    const templateContentForFirstItem = document.createDocumentFragment();

    const template = document.createElement('template');
    template.innerHTML = `
    <atomic-table-element label="Test Label 1">
    </atomic-table-element>
    <atomic-table-element label="Test Label 2">
    </atomic-table-element>`.trim();

    templateContentForFirstItem.appendChild(template.content);

    it('should log an error when the #templateContentForFirstItem prop value has no atomic-table-element', async () => {
      const host = document.createElement('div');
      const logger = {
        error: vi.fn(),
      };

      await tableLayoutFixture({
        host,
        logger,
        templateContentForFirstItem: document.createDocumentFragment(),
      });

      expect(logger.error).toHaveBeenCalledWith(
        'atomic-table-element elements missing in the template to display columns.',
        host
      );
    });

    it('should render one th element under the tr element for each atomic-table-element in #templateContentForFirstItem', async () => {
      const tableLayout = await tableLayoutFixture({
        templateContentForFirstItem,
      });

      const thElements = tableLayout.querySelectorAll('th');

      expect(thElements.length).toBe(2);
      expect(thElements.item(0)).toBeInTheDocument();
      expect(thElements.item(0).parentElement?.nodeName).toBe('TR');
      expect(thElements.item(1)).toBeInTheDocument();
      expect(thElements.item(1).parentElement?.nodeName).toBe('TR');
    });

    it('should render every th element with the correct part', async () => {
      const tableLayout = await tableLayoutFixture({
        templateContentForFirstItem,
      });

      const thElements = tableLayout.querySelectorAll('th');

      expect(thElements?.[0].part.value).toBe('result-table-heading-cell');
      expect(thElements?.[1].part.value).toBe('result-table-heading-cell');
    });

    it('should render one atomic-text element under each th element', async () => {
      const tableLayout = await tableLayoutFixture({
        templateContentForFirstItem,
      });

      const atomicTextElements = tableLayout.querySelectorAll('atomic-text');

      expect(atomicTextElements.length).toBe(2);
      expect(atomicTextElements.item(0)).toBeInTheDocument();
      expect(atomicTextElements.item(0).parentElement?.nodeName).toBe('TH');
      expect(atomicTextElements.item(1)).toBeInTheDocument();
      expect(atomicTextElements.item(1).parentElement?.nodeName).toBe('TH');
    });

    it("should apply the corresponding atomic-table-element's 'label' attribute to each atomic-text's 'value' attribute'", async () => {
      const tableLayout = await tableLayoutFixture({
        templateContentForFirstItem,
      });

      const atomicTextElements = tableLayout.querySelectorAll('atomic-text');

      expect(atomicTextElements?.[0].value).toBe('Test Label 1');
      expect(atomicTextElements?.[1].value).toBe('Test Label 2');
    });
  });
});

describe('renderTableRow', () => {
  const tableRowFixture = async (
    props: Partial<TableRowProps> = {},
    children: TemplateResult | typeof nothing = nothing
  ) => {
    return await fixture(
      html`${renderTableRow({
        props: {
          key: 'key',
          rowIndex: 0,
          setRef: () => {},
          ...props,
        },
      })(children)}`
    );
  };

  it('should render a tr element in the document', async () => {
    const tableRow = await tableRowFixture();

    expect(tableRow).toBeInTheDocument();
    expect(tableRow.tagName).toBe('TR');
  });

  it('should render the tr element with the correct part when the #rowIndex prop is an even number', async () => {
    const tableRow = await tableRowFixture({rowIndex: 0});

    expect(tableRow.part.contains('result-table-row')).toBe(true);
    expect(tableRow.part.contains('result-table-row-odd')).toBe(true);

    // Logic is reversed because #rowIndex is 0-based, so #rowIndex 0 is actually the 1st row in the rendered table.
    expect(tableRow.part.contains('result-table-row-even')).toBe(false);
  });

  it('should render the tr element with the correct part when the #rowIndex prop is an odd number, ', async () => {
    const tableRow = await tableRowFixture({rowIndex: 1});

    expect(tableRow.part.contains('result-table-row')).toBe(true);
    expect(tableRow.part.contains('result-table-row-odd')).toBe(false);

    // Logic is reversed because #rowIndex is 0-based, sor #rowIndex 1 is actually the 2nd row in the rendered table.
    expect(tableRow.part.contains('result-table-row-even')).toBe(true);
  });

  it('should call #setRef with the tr element', async () => {
    const setRef = vi.fn();

    const tableRow = await tableRowFixture({setRef});

    expect(setRef).toHaveBeenCalledWith(tableRow);
  });

  it('should render its children', async () => {
    const tableRow = await tableRowFixture(
      {},
      html`<div class="child"></div>
        <div class="child"></div>`
    );

    const childElements = tableRow.querySelectorAll('.child');

    expect(childElements.length).toBe(2);
    expect(childElements.item(0)).toBeInTheDocument();
    expect(childElements.item(1)).toBeInTheDocument();
  });
});

describe('renderTableData', () => {
  const tableDataFixture = async (props: Partial<TableDataProps> = {}) => {
    return await renderFunctionFixture(
      html`${renderTableData({
        props: {
          firstItem: buildFakeProduct(),
          itemRenderingFunction: undefined,
          key: 'key',
          renderItem: () => html``,
          templateContentForFirstItem: document.createDocumentFragment(),
          ...props,
        },
      })}`
    );
  };

  describe('when #itemRenderingFunction is defined', () => {
    const itemRenderingFunction = (_item: AnyItem) =>
      `
    <atomic-table-element label='Test Label 1'></atomic-table-element>
    <atomic-table-element label='Test Label 2'></atomic-table-element>`.trim();

    it('should render one td element per atomic-table-element returned by #itemRenderingFunction', async () => {
      const tableData = await tableDataFixture({
        itemRenderingFunction,
      });

      const tdElements = tableData.querySelectorAll('td');

      expect(tdElements.length).toBe(2);
      expect(tdElements.item(0)).toBeInTheDocument();
      expect(tdElements.item(1)).toBeInTheDocument();
    });

    it('should render every td element with the correct part', async () => {
      const tableData = await tableDataFixture({
        itemRenderingFunction,
      });

      const renderedTdElements = tableData.querySelectorAll('td');

      expect(renderedTdElements?.[0].part.value).toBe('result-table-cell');
      expect(renderedTdElements?.[1].part.value).toBe('result-table-cell');
    });

    it('should call #renderItem with the corresponding atomic-table-element for each item to render', async () => {
      const renderItem = vi.fn();

      await tableDataFixture({
        itemRenderingFunction,
        renderItem,
      });

      const tableElement1 = document.createElement('atomic-table-element');
      tableElement1.setAttribute('label', 'Test Label 1');
      const tableElement2 = document.createElement('atomic-table-element');
      tableElement2.setAttribute('label', 'Test Label 2');

      expect(renderItem).toHaveBeenCalledTimes(2);
      expect(renderItem).toHaveBeenNthCalledWith(1, tableElement1);
      expect(renderItem).toHaveBeenNthCalledWith(2, tableElement2);
    });
  });

  describe('when #itemRenderingFunction is not defined', () => {
    const templateContentForFirstItem = document.createDocumentFragment();

    const template = document.createElement('template');
    template.innerHTML =
      `<atomic-table-element label="Test Label 1"></atomic-table-element>
      <atomic-table-element label="Test Label 2"></atomic-table-element>`.trim();

    templateContentForFirstItem.appendChild(template.content);

    it('should render one td element per atomic-table-element returned by #itemRenderingFunction', async () => {
      const tableData = await tableDataFixture({
        templateContentForFirstItem,
      });

      const tdElements = tableData.querySelectorAll('td');

      expect(tdElements.length).toBe(2);
      expect(tdElements.item(0)).toBeInTheDocument();
      expect(tdElements.item(1)).toBeInTheDocument();
    });

    it('should render every td element with the correct part', async () => {
      const tableData = await tableDataFixture({
        templateContentForFirstItem,
      });

      const tdElements = tableData.querySelectorAll('td');

      expect(tdElements?.[0].part.value).toBe('result-table-cell');
      expect(tdElements?.[1].part.value).toBe('result-table-cell');
    });

    it('should call #renderItem with the corresponding atomic-table-element for each column to render', async () => {
      const renderItem = vi.fn();

      await tableDataFixture({
        templateContentForFirstItem,
        renderItem,
      });

      const tableElement1 = document.createElement('atomic-table-element');
      tableElement1.setAttribute('label', 'Test Label 1');
      const tableElement2 = document.createElement('atomic-table-element');
      tableElement2.setAttribute('label', 'Test Label 2');

      expect(renderItem).toHaveBeenCalledTimes(2);
      expect(renderItem).toHaveBeenNthCalledWith(1, tableElement1);
      expect(renderItem).toHaveBeenNthCalledWith(2, tableElement2);
    });

    describe('when #firstItem and itemRenderingFunction are undefined', () => {
      it('should use templateContentForFirstItem', async () => {
        const renderItem = vi.fn();

        await tableDataFixture({
          itemRenderingFunction: undefined,
          firstItem: undefined,
          templateContentForFirstItem,
          renderItem,
        });

        const tableElement1 = document.createElement('atomic-table-element');
        tableElement1.setAttribute('label', 'Test Label 1');
        const tableElement2 = document.createElement('atomic-table-element');
        tableElement2.setAttribute('label', 'Test Label 2');

        expect(renderItem).toHaveBeenCalledTimes(2);
        expect(renderItem).toHaveBeenNthCalledWith(1, tableElement1);
        expect(renderItem).toHaveBeenNthCalledWith(2, tableElement2);
      });
    });

    describe('when #templateContentForFirstItem is null', () => {
      it('should not render any td elements', async () => {
        const tableData = await tableDataFixture({
          templateContentForFirstItem: null as unknown as DocumentFragment,
        });

        const tdElements = tableData.querySelectorAll('td');

        expect(tdElements.length).toBe(0);
      });

      it('should not call #renderItem', async () => {
        const renderItem = vi.fn();

        await tableDataFixture({
          templateContentForFirstItem: null as unknown as DocumentFragment,
          renderItem,
        });

        expect(renderItem).not.toHaveBeenCalled();
      });
    });
  });
});
