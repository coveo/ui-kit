import {
  generateComponentHTML,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {
  addFieldValueInResponse,
  addResultList,
  buildTemplateWithSections,
} from '../result-list-actions';
import {
  resultImageComponent,
  ResultImageSelectors,
} from './result-image-selectors';

const field = 'somethumbnail';
const image = 'https://www.coveo.com/public/img/logos/coveo/coveo_logo_en.svg';

const addResultImageInResultList = () =>
  addResultList(
    buildTemplateWithSections({
      visual: generateComponentHTML(resultImageComponent, {field}),
    })
  );

describe('Result Image Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultImageComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent(ResultImageSelectors.shadow);
    CommonAssertions.assertConsoleError();
  });

  describe('when the field does not exist for the result', () => {
    beforeEach(() => {
      new TestFixture().with(addResultImageInResultList()).init();
    });

    CommonAssertions.assertRemovesComponent(ResultImageSelectors.shadow);
    CommonAssertions.assertConsoleError(false);
  });

  describe('when the field value is a string', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultImageInResultList())
        .with(addFieldValueInResponse(field, image))
        .init();
    });

    it('should render the component', () => {
      ResultImageSelectors.resultImage().should('have.attr', 'src', image);
    });

    CommonAssertions.assertAccessibility(ResultImageSelectors.firstInResult);
  });
});
