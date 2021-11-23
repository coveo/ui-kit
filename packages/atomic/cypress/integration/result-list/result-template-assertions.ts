import {Components} from '../../../src/components';
import {should} from '../common-assertions';
import {ResultListSelectors} from './result-list-selectors';
import {ResultTableSelectors} from './result-table-selectors';
import {ResultTemplateSelectors} from './result-template-selectors';

export type ResultDisplayImageSize = Components.AtomicResult['imageSize'];

export function assertRendersTemplate(shouldBeRendered: boolean) {
  it(`${should(shouldBeRendered)} render the template`, () => {
    ResultTemplateSelectors.customContentInList().should(
      shouldBeRendered ? 'exist' : 'not.exist'
    );
  });
}

export function assertResultImageSize(size: ResultDisplayImageSize) {
  it(`enforces the "${size}" image size on the result`, () => {
    ResultListSelectors.firstResultRoot().should('have.class', `image-${size}`);
  });
}

export function assertCellImageSize(size: ResultDisplayImageSize) {
  it(`enforces the "${size}" image size on the result`, () => {
    ResultTableSelectors.firstRowCellsContent()
      .first()
      .should('have.class', `image-${size}`);
  });
}
