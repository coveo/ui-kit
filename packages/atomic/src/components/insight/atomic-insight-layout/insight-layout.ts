import {
  sectionSelector,
  findSection,
} from '../../common/atomic-layout-section/sections';

const tabsSelector = 'atomic-insight-tabs';
const refineModalSelector = 'atomic-insight-refine-modal';
const searchBoxSelector = 'atomic-insight-search-box';
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
      display: flex;
      flex-wrap: wrap;
      grid-gap: 0.5rem;
      background: var(--atomic-neutral-light);
      padding-top: 1.5rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      box-sizing: border-box;
      ${!hasTabs ? 'padding-bottom: 1.5rem;' : ''}
    }

    ${sectionSelector('search')} ${searchBoxSelector} {
      flex-grow: 1;
    }

    ${toggleSelectors.map(
      (toggleSelector) => `${sectionSelector('search')} ${toggleSelector} {
      flex-shrink: 0;
    }`
    )}

    ${sectionSelector('search')} ${tabsSelector} {
      width: 100%
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
