import {should} from '../common-assertions';
import {ResultTemplateSelectors} from './result-template-selectors';

export function assertRendersTemplate(shouldBeRendered: boolean) {
  it(`${should(shouldBeRendered)} render the template`, () => {
    ResultTemplateSelectors.customContentInList().should(
      shouldBeRendered ? 'exist' : 'not.exist'
    );
  });
}
