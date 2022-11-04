import {sectionSelector} from '../../common/atomic-layout-section/sections';

const pagerSelector = 'atomic-pager';

export function buildIPXLayout(element: HTMLElement) {
  const id = element.id;
  const layoutSelector = `atomic-ipx-layout#${id}`;

  const interfaceStyle = `
  ${layoutSelector} {
    display: grid;
    grid-template-rows: auto auto auto 8fr 1fr;
    max-height: 100%;
    box-sizing: border-box;
    width: 500px;
    height: 1000px;
    margin-left: auto;
    margin-right: auto;
    box-shadow: 0px 3px 24px 0px #0000001a;
  }`;

  const search = `${sectionSelector('search')} {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr auto;
      grid-gap: 0.5rem;
      background: var(--atomic-neutral-light);
      padding: 1.5rem;
      box-sizing: border-box;
     }
    }
    ${sectionSelector('search')} {
      grid-column: 1 / 5;
    }
    `;

  const status = `${sectionSelector('status')} {
    padding: 1rem;
  }`;

  const results = `
    ${sectionSelector('results')} {
      overflow: auto;
    }
    `;

  const pagination = `
    ${sectionSelector('pagination')} ${pagerSelector} {
      background: var(--atomic-neutral-light);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  return [interfaceStyle, search, status, results, pagination]
    .filter((declaration) => declaration !== '')
    .join('\n\n');
}
