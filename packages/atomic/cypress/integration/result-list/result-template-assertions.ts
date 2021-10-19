import {Components} from '../../../src/components';
import {should} from '../common-assertions';
import {ResultListSelectors} from './result-list-selectors';
import {ResultTemplateSelectors} from './result-template-selectors';

export type ResultDisplayImageSize = Components.AtomicResult['image'];

export function assertRendersTemplate(shouldBeRendered: boolean) {
  it(`${should(shouldBeRendered)} render the template`, () => {
    ResultTemplateSelectors.customContentInList().should(
      shouldBeRendered ? 'exist' : 'not.exist'
    );
  });
}

export function assertResultImageSize(size: ResultDisplayImageSize) {
  it(`enforces the "${size}" image size on the result`, () => {
    ResultListSelectors.result()
      .first()
      .should(([result]) =>
        expect((result as Components.AtomicResult).image).to.eq(size)
      );
  });
}
