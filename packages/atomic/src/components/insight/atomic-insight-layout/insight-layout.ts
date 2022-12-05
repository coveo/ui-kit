import {
  sectionSelector,
  findSection,
} from '../../common/atomic-layout-section/sections';

const tabsSelector = 'atomic-insight-tabs';
const refineModalSelector = 'atomic-insight-refine-modal';
const toggleSelectors = [
  'atomic-insight-refine-toggle',
  'atomic-insight-edit-toggle',
  'atomic-insight-history-toggle',
];

export function buildInsightLayout(element: HTMLElement, widget: boolean) {
  const id = element.id;
  const layoutSelector = `atomic-insight-layout#${id}`;

  const hasTabs = Boolean(
    findSection(element, 'search')?.querySelector(tabsSelector)
  );

  const numToggles = toggleSelectors.reduce(
    (numToggles, selector) =>
      findSection(element, 'search')?.querySelector(selector)
        ? numToggles + 1
        : numToggles,
    0
  );

  const interfaceStyle = widget
    ? `
  ${layoutSelector} {
    display: grid;
    grid-template-rows: auto auto 8fr 1fr;
    max-height: 100%;
    box-sizing: border-box;
  }
  ${layoutSelector} ${refineModalSelector} {
    grid-row-start: 5;
  }`
    : '';

  const search = `${sectionSelector('search')} {
      width: 100%;
      display: grid;
      grid-template-columns: ${
        numToggles ? `1fr repeat(${numToggles}, auto)` : '1fr'
      };
      grid-gap: 0.5rem;
      background: var(--atomic-neutral-light);
      padding-top: 1.5rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      box-sizing: border-box;
      ${!hasTabs ? 'padding-bottom: 1.5rem;' : ''}
    }
    ${sectionSelector('search')} ${tabsSelector} {
      grid-column: ${numToggles ? `1 / ${numToggles + 2}` : 1};
    }
    `;

  const results = `
    ${sectionSelector('results')} {
      overflow: auto;
    }
    `;

  return [interfaceStyle, search, results]
    .filter((declaration) => declaration !== '')
    .join('\n\n');
}
