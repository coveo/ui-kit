import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../fixtures/test-fixture';
import {toArray} from '../../utils/arrayUtils';
import {buildTemplateWithoutSections} from './result-list-actions';
import {resultListComponent} from './result-list-selectors';
import {resultTemplateComponent} from './result-template-selectors';

export interface ResultTableColumn {
  label: string;
  content: HTMLElement | HTMLElement[];
}

function buildTableElement(column: ResultTableColumn) {
  const columnEl = generateComponentHTML('atomic-table-element', {
    label: column.label,
  });
  toArray(column.content).forEach((child) => {
    if (child.tagName.toLowerCase() === resultTemplateComponent) {
      const sections = Array.from(
        child.querySelector('template')!.content.children
      );
      sections.forEach((section) => columnEl.appendChild(section));
    } else {
      columnEl.appendChild(child);
    }
  });
  return columnEl;
}

export const addResultTable =
  (columns: ResultTableColumn[], props: TagProps = {}) =>
  (fixture: TestFixture) => {
    const resultList = generateComponentHTML(resultListComponent, {
      display: 'table',
      ...props,
    });
    resultList.appendChild(
      buildTemplateWithoutSections(
        columns.map((column) => buildTableElement(column))
      )
    );
    fixture.withElement(resultList);
  };
