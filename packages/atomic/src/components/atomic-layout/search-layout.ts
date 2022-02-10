import {findSection, sectionSelector} from '../atomic-layout-section/sections';

export function buildSearchLayout(
  element: HTMLElement,
  mobileBreakpoint: string
) {
  const id = element.id;
  const layoutSelector = `atomic-layout[layout='search']#${id}`;

  const wrapLayout = (content: string) => `${layoutSelector} {${content}}`;

  const wrapMediaQuery = (content: string) =>
    `@media only screen and (min-width: ${mobileBreakpoint}) {${content}}`;

  const facetsDeclarations = () => {
    const facetsSection = findSection(element, 'facets');
    const mainSection = findSection(element, 'main');
    if (!facetsSection || !mainSection) {
      return '';
    }

    const facetsMin = facetsSection.minWidth || '272px';
    const facetsMax = facetsSection.maxWidth || '350px';
    const mainMin = mainSection.minWidth || '656px';
    const mainMax = mainSection.maxWidth || '1100px';

    const gridTemplateAreas = wrapLayout(`grid-template-areas:
    '. .                     atomic-section-search .'
    '. atomic-section-facets atomic-section-main   .'
    '. atomic-section-facets .                     .';`);
    const gridTemplateColumns = wrapLayout(
      `grid-template-columns: 1fr minmax(${facetsMin}, ${facetsMax}) minmax(${mainMin}, ${mainMax}) 1fr;`
    );
    const columnGap = wrapLayout('column-gap: var(--atomic-layout-spacing-x);');
    const displayFacetsSection = `${layoutSelector} ${sectionSelector(
      'facets'
    )} {display: block;}`;

    return wrapMediaQuery(
      [
        gridTemplateAreas,
        gridTemplateColumns,
        columnGap,
        displayFacetsSection,
      ].join('')
    );
  };

  const sortDeclarations = () => {
    const topBarSection = findSection(element, 'status');
    if (!topBarSection) {
      return '';
    }

    const refineToggle = topBarSection.querySelector('atomic-refine-toggle');
    const sortDropdown = topBarSection.querySelector('atomic-sort-dropdown');

    if (!refineToggle || !sortDropdown) {
      return '';
    }

    const selector = `${layoutSelector} ${sectionSelector('status')}`;

    const hideMobileSort = `${selector} atomic-sort-dropdown {display:none;}`;
    const showDesktopSort = wrapMediaQuery(
      `${selector} atomic-sort-dropdown {display:block;}`
    );
    const hideDesktopRefine = wrapMediaQuery(
      `${selector} atomic-refine-toggle {display:none;}`
    );

    return [hideMobileSort, showDesktopSort, hideDesktopRefine].join('');
  };

  return [facetsDeclarations(), sortDeclarations()].join('');
}
