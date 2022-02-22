import {findSection, sectionSelector} from '../atomic-layout-section/sections';

export function buildSearchLayout(
  element: HTMLElement,
  mobileBreakpoint: string
) {
  const id = element.id;
  const layoutSelector = `atomic-search-layout#${id}`;
  const mediaQuerySelector = `@media only screen and (min-width: ${mobileBreakpoint})`;

  const displayLayout = `${layoutSelector} { display: grid }`;

  const facetsDeclarations = () => {
    const facetsSection = findSection(element, 'facets');
    const mainSection = findSection(element, 'main');
    if (!facetsSection || !mainSection) {
      return '';
    }

    const facetsMin = facetsSection.minWidth || '272px';
    const facetsMax = facetsSection.maxWidth || '350px';
    const mainMin = mainSection.minWidth || '50%';
    const mainMax = mainSection.maxWidth || '1100px';

    return `${mediaQuerySelector} {
      ${layoutSelector} {
        grid-template-areas:
          '. .                     atomic-section-search .'
          '. atomic-section-facets atomic-section-main   .'
          '. atomic-section-facets .                     .';
        grid-template-columns: 
          1fr minmax(${facetsMin}, ${facetsMax}) minmax(${mainMin}, ${mainMax}) 1fr;
        column-gap: var(--atomic-layout-spacing-x);
      }

      ${layoutSelector} ${sectionSelector('facets')} {
        display: block;
      }
    }`;
  };

  const refineDeclarations = () => {
    const statusSection = findSection(element, 'status');
    if (!statusSection) {
      return '';
    }

    const refineToggle = statusSection.querySelector('atomic-refine-toggle');
    if (!refineToggle) {
      return '';
    }

    const statusSelector = `${layoutSelector} ${sectionSelector('status')}`;
    return `${statusSelector} atomic-sort-dropdown {
      display:none;
    }

    ${mediaQuerySelector} {
     ${statusSelector} atomic-sort-dropdown {
       display:block;
      }

      ${statusSelector} atomic-refine-toggle {
        display: none;
       }
    }`;
  };

  return [displayLayout, facetsDeclarations(), refineDeclarations()].join('');
}
