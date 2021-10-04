import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {ComponentErrorSelectors} from '../component-error-selectors';
import {
  addResultList,
  buildTemplateWithoutSections,
} from '../result-list/result-list-actions';
import {
  resultListComponent,
  ResultListSelectors,
} from '../result-list/result-list-selectors';
import {
  resultTemplateComponent,
  ResultTemplateSelectors,
} from './result-template-selectors';

function buildScriptElement(content: string) {
  const element = generateComponentHTML('script');
  element.innerHTML = content;
  return element as HTMLScriptElement;
}

function buildCustomTemplateContent() {
  const element = generateComponentHTML('span');
  element.innerText = 'Custom template';
  return element;
}

function firstResultShouldUseCustomTemplate() {
  ResultListSelectors.firstResult().then((firstResult) => {
    expect(firstResult[0].innerHTML).contain('<span>Custom template</span>');
  });
}

describe('Result Template Component', () => {
  describe(`when not a child of an "${resultListComponent}" component`, () => {
    it(`should render an "${ComponentErrorSelectors.component}" component`, () => {
      new TestFixture().withElement(buildTemplateWithoutSections([])).init();
      ResultTemplateSelectors.shadow()
        .find(ComponentErrorSelectors.component)
        .should('be.visible');
    });
  });

  describe('when it does not have a "template" element has a child', () => {
    it(`should render an "${ComponentErrorSelectors.component}" component (in the result list)`, () => {
      const templateEl = generateComponentHTML(resultTemplateComponent);
      templateEl.appendChild(generateComponentHTML('p'));
      new TestFixture().with(addResultList(templateEl)).init();
      ResultTemplateSelectors.shadow()
        .find(ComponentErrorSelectors.component)
        .should('be.visible');
    });
  });

  it('should save the template content in order to render', () => {
    new TestFixture()
      .with(
        addResultList(
          buildTemplateWithoutSections(buildCustomTemplateContent())
        )
      )
      .init();
    firstResultShouldUseCustomTemplate();
  });

  it('the "must-match-x" prop should add a condition to the template', () => {
    const filetype = 'veryspecificfiletype';
    new TestFixture()
      .with(
        addResultList(
          buildTemplateWithoutSections(buildCustomTemplateContent(), {
            'must-match-filetype': filetype,
          })
        )
      )
      .withCustomResponse((response) => {
        response.results.forEach((result) => (result.raw.filetype = filetype));
      })
      .init();

    firstResultShouldUseCustomTemplate();
  });

  it('the "must-not-match-x" prop should add a condition to the template', () => {
    const filetype = 'veryspecificfiletype';
    new TestFixture()
      .with(
        addResultList(
          buildTemplateWithoutSections(buildCustomTemplateContent(), {
            'must-not-match-filetype': 'anotherfiletype',
          })
        )
      )
      .withCustomResponse((response) => {
        response.results.forEach((result) => (result.raw.filetype = filetype));
      })
      .init();

    firstResultShouldUseCustomTemplate();
  });

  it('the "conditions" prop should add a condition(s) to the template', () => {
    const title = 'averyspecifictitle';
    const scriptEl = buildScriptElement(
      `
        document.querySelector('atomic-result-template#mytemplate').conditions = [
          (result) => /${title}/i.test(result.title),
        ];
      `
    );
    new TestFixture()
      .with(
        addResultList(
          buildTemplateWithoutSections(
            [scriptEl, buildCustomTemplateContent()],
            {
              id: 'mytemplate',
            }
          )
        )
      )
      .withCustomResponse((response) => {
        response.results.forEach((result) => (result.title = title));
      })
      .init();

    firstResultShouldUseCustomTemplate();
  });
});
