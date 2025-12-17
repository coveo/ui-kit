import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicResultTablePlaceholder} from './atomic-result-table-placeholder';
import './atomic-result-table-placeholder';

describe('atomic-result-table-placeholder', () => {
  const renderComponent = async ({
    props = {},
  }: {
    props?: Partial<{
      density: ItemDisplayDensity;
      imageSize: ItemDisplayImageSize;
      rows: number;
    }>;
  } = {}) => {
    const element = await fixture<AtomicResultTablePlaceholder>(html`
      <atomic-result-table-placeholder
        .density=${props.density || 'normal'}
        .imageSize=${props.imageSize || 'icon'}
        .rows=${props.rows || 3}
      ></atomic-result-table-placeholder>
    `);

    return {
      element,
      get table() {
        return element.shadowRoot?.querySelector('table');
      },
      get thead() {
        return element.shadowRoot?.querySelector('thead');
      },
      get tbody() {
        return element.shadowRoot?.querySelector('tbody');
      },
      get headerRows() {
        return element.shadowRoot?.querySelectorAll('thead tr');
      },
      get bodyRows() {
        return element.shadowRoot?.querySelectorAll('tbody tr');
      },
      get headerCells() {
        return element.shadowRoot?.querySelectorAll('thead th');
      },
    };
  };

  describe('rendering', () => {
    it('should render the component', async () => {
      const {element} = await renderComponent();
      await expect.element(element).toBeInTheDocument();
    });

    it('should render a table element', async () => {
      const {table} = await renderComponent();
      expect(table).toBeInTheDocument();
    });

    it('should render thead with aria-hidden', async () => {
      const {thead} = await renderComponent();
      expect(thead).toBeInTheDocument();
      expect(thead).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render 3 header cells', async () => {
      const {headerCells} = await renderComponent();
      expect(headerCells?.length).toBe(3);
    });

    it('should render tbody element', async () => {
      const {tbody} = await renderComponent();
      expect(tbody).toBeInTheDocument();
    });
  });

  describe('with different row counts', () => {
    it('should render 3 rows by default', async () => {
      const {bodyRows} = await renderComponent({props: {rows: 3}});
      expect(bodyRows?.length).toBe(3);
    });

    it('should render 1 row when rows is 1', async () => {
      const {bodyRows} = await renderComponent({props: {rows: 1}});
      expect(bodyRows?.length).toBe(1);
    });

    it('should render 5 rows when rows is 5', async () => {
      const {bodyRows} = await renderComponent({props: {rows: 5}});
      expect(bodyRows?.length).toBe(5);
    });

    it('should render 10 rows when rows is 10', async () => {
      const {bodyRows} = await renderComponent({props: {rows: 10}});
      expect(bodyRows?.length).toBe(10);
    });
  });

  describe('with different densities', () => {
    it('should apply normal density class', async () => {
      const {table} = await renderComponent({props: {density: 'normal'}});
      expect(table?.classList.contains('density-normal')).toBe(true);
    });

    it('should apply comfortable density class', async () => {
      const {table} = await renderComponent({
        props: {density: 'comfortable'},
      });
      expect(table?.classList.contains('density-comfortable')).toBe(true);
    });

    it('should apply compact density class', async () => {
      const {table} = await renderComponent({props: {density: 'compact'}});
      expect(table?.classList.contains('density-compact')).toBe(true);
    });
  });

  describe('with different image sizes', () => {
    it('should apply icon image size class', async () => {
      const {table} = await renderComponent({props: {imageSize: 'icon'}});
      expect(table?.classList.contains('image-icon')).toBe(true);
    });

    it('should apply small image size class', async () => {
      const {table} = await renderComponent({props: {imageSize: 'small'}});
      expect(table?.classList.contains('image-small')).toBe(true);
    });

    it('should apply large image size class', async () => {
      const {table} = await renderComponent({props: {imageSize: 'large'}});
      expect(table?.classList.contains('image-large')).toBe(true);
    });

    it('should apply none image size class', async () => {
      const {table} = await renderComponent({props: {imageSize: 'none'}});
      expect(table?.classList.contains('image-none')).toBe(true);
    });
  });

  describe('table structure', () => {
    it('should always apply display-table class', async () => {
      const {table} = await renderComponent();
      expect(table?.classList.contains('display-table')).toBe(true);
    });

    it('should apply animate-pulse class for loading animation', async () => {
      const {table} = await renderComponent();
      expect(table?.classList.contains('animate-pulse')).toBe(true);
    });

    it('should apply list-root class', async () => {
      const {table} = await renderComponent();
      expect(table?.classList.contains('list-root')).toBe(true);
    });

    it('should render one header row', async () => {
      const {headerRows} = await renderComponent();
      expect(headerRows?.length).toBe(1);
    });

    it('should render 3 cells in each body row', async () => {
      const {bodyRows} = await renderComponent({props: {rows: 2}});
      const firstRow = bodyRows?.[0];
      const cells = firstRow?.querySelectorAll('td');
      expect(cells?.length).toBe(3);
    });
  });

  describe('placeholder content', () => {
    it('should render placeholder divs in header cells', async () => {
      const {headerCells} = await renderComponent();
      headerCells?.forEach((cell) => {
        const div = cell.querySelector('div');
        expect(div).toBeInTheDocument();
        expect(div?.classList.contains('bg-neutral')).toBe(true);
        expect(div?.classList.contains('rounded')).toBe(true);
      });
    });

    it('should render placeholder divs in body cells', async () => {
      const {bodyRows} = await renderComponent({props: {rows: 1}});
      const firstRow = bodyRows?.[0];
      const cells = firstRow?.querySelectorAll('td');

      // First cell should have 3 placeholder divs
      const firstCellDivs = cells?.[0]?.querySelectorAll('div');
      expect(firstCellDivs?.length).toBe(3);

      // Second and third cells should have 1 placeholder div each
      const secondCellDivs = cells?.[1]?.querySelectorAll('div');
      expect(secondCellDivs?.length).toBe(1);

      const thirdCellDivs = cells?.[2]?.querySelectorAll('div');
      expect(thirdCellDivs?.length).toBe(1);
    });

    it('should apply placeholder classes to all divs', async () => {
      const {tbody} = await renderComponent({props: {rows: 1}});
      const allDivs = tbody?.querySelectorAll('div');

      allDivs?.forEach((div) => {
        expect(div.classList.contains('bg-neutral')).toBe(true);
        expect(div.classList.contains('rounded')).toBe(true);
        expect(div.classList.contains('block')).toBe(true);
      });
    });
  });
});
