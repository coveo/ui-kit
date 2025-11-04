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
const invalidImage = 'https://www.dummy.coveo.com/image.svg';
const fallback = 'https://picsum.photos/seed/picsum/200/300';
const notAString = 123;

const addResultImageInResultList = () =>
  addResultList(
    buildTemplateWithSections({
      visual: generateComponentHTML(resultImageComponent, {field, fallback}),
    })
  );

describe('Result Image Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultImageComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent();
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

    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(ResultImageSelectors.firstInResult);
    });
  });

  describe('when the field does not exist', () => {
    beforeEach(() => {
      new TestFixture().with(addResultImageInResultList()).init();
    });

    it('should render the component with the fallback image', () => {
      ResultImageSelectors.resultImage().should('have.attr', 'src', fallback);
    });

    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(ResultImageSelectors.firstInResult);
    });
  });

  describe('when the url is not a string', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultImageInResultList())
        .with(addFieldValueInResponse(field, notAString))
        .init();
    });

    it('should render the component with fallback image', () => {
      ResultImageSelectors.resultImage().should('have.attr', 'src', fallback);
    });

    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(ResultImageSelectors.firstInResult);
    });
  });

  describe('when the image url is not valid', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultImageInResultList())
        .with(addFieldValueInResponse(field, invalidImage))
        .init();
    });

    it('should render the component with fallback image', () => {
      ResultImageSelectors.resultImage().should('have.attr', 'src', fallback);
    });

    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(ResultImageSelectors.firstInResult);
    });
  });
});
