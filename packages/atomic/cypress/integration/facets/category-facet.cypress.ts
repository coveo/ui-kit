import {
  setUpPage,
  shouldRenderErrorComponent,
  injectComponent,
} from '../../utils/setupComponent';
import {
  FacetSelectors,
  createAliasShadow,
  createAliasFacetUL,
  FacetAlias,
  BreadcrumbSelectors,
} from './facet-selectors';
import {
  validateFacetComponentLoaded,
  validateFacetComponentVisible,
  validateFacetNumberofValueEqual,
  assertNonZeroFacetCount,
  assertClickShowMore,
  assertShowMoreUA,
  assertClickShowLess,
  assertShowLessUA,
} from './facet-utils';
import {doSortAlphanumeric} from '../../utils/componentUtils';

const categoryFacetProp = {
  field: 'geographicalhierarchy',
  label: 'Atlas',
  defaultCategoryLabel: 'All Categories',
  numberOfValue: 5,
  numberOfFacetValueAfterExpand: 7,
};

const canadaHierarchy = ['North America', 'Canada', 'Alberta'];
function setupCategoryFacet(field: string, label: string, option?: {}) {
  setUpPage(`
    <atomic-breadcrumb-manager></atomic-breadcrumb-manager>    
    <atomic-category-facet field="${field}" label="${label}" ${option}></atomic-category-facet>`);
}

function assertClearAllTitleAndTotalParents(
  clearAllTitle: string,
  totalParents: number
) {
  cy.get(FacetAlias.facetShadow)
    .find(FacetSelectors.categoryFacetClearLevelButton)
    .should('contain.text', clearAllTitle);
  cy.get(FacetAlias.facetShadow)
    .find('ul[part="parents"] li')
    .its('length')
    .should('eq', totalParents);
}

function assertTotalChildrentMoreThan(value: number) {
  cy.get(FacetAlias.facetShadow)
    .find('ul')
    .not('[part="parents"]')
    .find('li')
    .its('length')
    .should('be.gt', value);
}

function clickOnCategoryFacetWithValue(value: string) {
  cy.get(FacetAlias.facetUL)
    .find(FacetSelectors.categoryFacetNextLevelButton)
    .contains(value)
    .click();
}

describe('Category Facet with default setting', () => {
  beforeEach(() => {
    setupCategoryFacet(categoryFacetProp.field, categoryFacetProp.label);
    cy.wait('@coveoSearch');
    createAliasShadow(categoryFacetProp.field, FacetSelectors.categoryFacet);
    createAliasFacetUL(categoryFacetProp.field, FacetSelectors.categoryFacet);
    cy.wait('@coveoAnalytics');
  });

  it('Should load, pass accessibility test, have correct label, facetCount and no facetSearch', () => {
    validateFacetComponentLoaded(
      categoryFacetProp.label,
      FacetSelectors.categoryFacet
    );
    cy.get(FacetAlias.facetShadow)
      .find(FacetSelectors.facetSearchbox)
      .should('not.exist');
  });

  it('Should contain ShowMore buttons but should not contain "All Categories" button', () => {
    cy.get(FacetAlias.facetShadow)
      .find(FacetSelectors.categoryFacetClearLevelButton)
      .should('not.exist');
    cy.get(FacetAlias.facetShadow)
      .find(FacetSelectors.showMoreButton)
      .should('be.visible');
  });

  it('Should not display facetValue in Alphanumeric order', () => {
    cy.getTextOfAllElements(FacetAlias.facetAllValueLabel).then(
      (originalValues) => {
        expect(originalValues).not.to.eql(doSortAlphanumeric(originalValues));
      }
    );
  });

  describe('When user clicks on Arrow to go to next level', () => {
    beforeEach(() => {
      clickOnCategoryFacetWithValue(canadaHierarchy[0]);
      cy.wait('@coveoSearch');
      cy.get(FacetAlias.facetShadow)
        .find(FacetSelectors.categoryFacetClearLevelButton)
        .as('categoryClearAllButton');
    });

    it('Should display its parent and default Category Label should display', () => {
      assertClearAllTitleAndTotalParents(
        categoryFacetProp.defaultCategoryLabel,
        1
      );
    });

    it('Should contain more than 1 child on second level', () => {
      assertTotalChildrentMoreThan(1);
    });

    it('Should log UA', () => {
      cy.wait('@coveoAnalytics').then((intercept: any) => {
        const analyticsBody = intercept.request.body;
        expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
        expect(analyticsBody.customData).to.have.property(
          'facetValue',
          canadaHierarchy[0]
        );
        expect(analyticsBody.customData).to.have.property(
          'facetField',
          categoryFacetProp.field
        );
        expect(analyticsBody.facetState[0]).to.have.property(
          'state',
          'selected'
        );
        expect(analyticsBody.facetState[0]).to.have.property(
          'field',
          categoryFacetProp.field
        );
        expect(analyticsBody.facetState[0]).to.have.property(
          'facetType',
          'hierarchical'
        );
      });
    });

    it('Should trigger breadcrumb and display correctly', () => {
      cy.get(BreadcrumbSelectors.breadcrumb)
        .shadow()
        .find('div[part="breadcrumb-wrapper"]')
        .find('button[part="breadcrumb-button"]')
        .should('be.visible')
        .contains(canadaHierarchy[0]);
    });

    describe('When user click on "All Categories" button', () => {
      beforeEach(() => {
        cy.get('@categoryClearAllButton').click();
        cy.wait('@coveoAnalytics');
      });

      it('Should go back to the first parent level', () => {
        cy.get('@categoryClearAllButton').should('not.exist');
        assertNonZeroFacetCount();
      });

      it('Should log UA correctly', () => {
        cy.wait('@coveoAnalytics').then((intercept: any) => {
          const analyticsBody = intercept.request.body;
          expect(analyticsBody).to.have.property(
            'actionCause',
            'facetClearAll'
          );
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            categoryFacetProp.field
          );
        });
      });
    });

    describe('When user clicks ShowMore button', () => {
      it('Should expand list of childrens on same level', () => {
        assertClickShowMore(categoryFacetProp.numberOfValue);
      });

      it('Should log UA correctly', () => {
        cy.wait('@coveoAnalytics');
        assertShowMoreUA(categoryFacetProp.field);
      });

      describe('When user click ShowLess button', () => {
        it('Should collapse the list and hide ShowLess button', () => {
          assertClickShowLess(categoryFacetProp.numberOfValue * 2);
        });

        it('Should log UA correctly', () => {
          cy.wait('@coveoAnalytics');
          assertShowLessUA(categoryFacetProp.field);
        });
      });
    });
  });

  describe('When user goes to last child on level 3', () => {
    beforeEach(() => {
      clickOnCategoryFacetWithValue(canadaHierarchy[0]);
      cy.wait('@coveoSearch');
      cy.wait('@coveoAnalytics');
      clickOnCategoryFacetWithValue(canadaHierarchy[1]);
      cy.wait('@coveoSearch');
      cy.wait('@coveoAnalytics');
      clickOnCategoryFacetWithValue(canadaHierarchy[2]);
      cy.wait('@coveoSearch');
    });

    it('Should have correct 3 parents level up and default Category Label', () => {
      assertClearAllTitleAndTotalParents(
        categoryFacetProp.defaultCategoryLabel,
        3
      );
    });

    it('Should log UA correctly', () => {
      cy.wait('@coveoAnalytics').then((intercept: any) => {
        const analyticsBody = intercept.request.body;
        expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
        expect(analyticsBody.customData).to.have.property(
          'facetField',
          categoryFacetProp.field
        );
        expect(analyticsBody.customData).to.have.property(
          'facetValue',
          canadaHierarchy.join(';')
        );
      });
    });

    it('Should not contain any other level', () => {
      cy.get(FacetAlias.facetShadow)
        .find('ul[part="parents"]')
        .find('li')
        .contains(canadaHierarchy[2])
        .find('div.arrow-size')
        .should('not.exist');
    });

    it('Should display correctly in URL hash', () => {
      const categoryFacetListInUrl = canadaHierarchy.join(',');
      const urlHash = `#cf[${categoryFacetProp.field}]=${encodeURI(
        categoryFacetListInUrl
      )}`;
      cy.url().should('include', urlHash);
    });

    it('Should trigger breadcrumb and display correctly', () => {
      const text = canadaHierarchy.join(' / ');
      cy.get(BreadcrumbSelectors.breadcrumb)
        .shadow()
        .find('div[part="breadcrumb-wrapper"]')
        .find('button[part="breadcrumb-button"]')
        .should('be.visible')
        .contains(text);
    });
  });

  describe('When user clicks ShowMore button', () => {
    it('Should expand list of facetValue and dislay ShowLess button', () => {
      assertClickShowMore(
        categoryFacetProp.numberOfValue,
        categoryFacetProp.numberOfFacetValueAfterExpand
      );
    });

    it('Should log UA correctly', () => {
      assertShowMoreUA(categoryFacetProp.field);
    });
  });

  describe('When user clicks ShowLess button', () => {
    it('Should collapse the facet list and hide button ShowLess', () => {
      assertClickShowLess(
        categoryFacetProp.numberOfFacetValueAfterExpand,
        categoryFacetProp.numberOfValue
      );
    });

    it('Should log UA correctly', () => {
      assertShowLessUA(categoryFacetProp.field);
    });
  });
});

describe('Category Facet with custom numberOfValues', () => {
  //TODO: enable this test when numberOfValues is supported properly in categoryFacet
  const numberOfValues = 6;
  beforeEach(() => {
    setupCategoryFacet(
      categoryFacetProp.field,
      categoryFacetProp.label,
      `number-of-values=${numberOfValues}`
    );
    createAliasShadow(categoryFacetProp.field, FacetSelectors.categoryFacet);
    createAliasFacetUL(categoryFacetProp.field, FacetSelectors.categoryFacet);
    cy.wait('@coveoAnalytics');
  });

  it('Should load, pass accessibility test and have correct label and facetCount', () => {
    validateFacetComponentLoaded(
      categoryFacetProp.label,
      FacetSelectors.categoryFacet
    );
  });

  it('Should contain custom numberOfValues', () => {
    validateFacetNumberofValueEqual(numberOfValues);
  });
});

describe('Category Facet with facetSearchEnable', () => {
  beforeEach(() => {
    setupCategoryFacet(
      categoryFacetProp.field,
      categoryFacetProp.label,
      'enable-facet-search=true'
    );
    createAliasShadow(categoryFacetProp.field, FacetSelectors.categoryFacet);
    createAliasFacetUL(categoryFacetProp.field, FacetSelectors.categoryFacet);
    cy.wait('@coveoAnalytics');
  });

  it('Should load, pass accessibility test, have correct label, and facetCount', () => {
    validateFacetComponentLoaded(
      categoryFacetProp.label,
      FacetSelectors.categoryFacet
    );
  });

  it('Should have facet searchbox', () => {
    cy.get(FacetAlias.facetShadow)
      .find(FacetSelectors.facetSearchbox)
      .should('be.visible');
  });

  describe('When user starts typing on facet searchbox', () => {
    it('Should display search results correctly');
    it('Should trigger new filter when item is selected from search dropdown');
  });
});

describe('Category Facet with custom delimiting character', () => {
  const delimitingCharacter = '|';
  beforeEach(() => {
    setupCategoryFacet(
      categoryFacetProp.field,
      categoryFacetProp.label,
      `delimiting-character="${delimitingCharacter}"`
    );
    createAliasShadow(categoryFacetProp.field, FacetSelectors.categoryFacet);
    createAliasFacetUL(categoryFacetProp.field, FacetSelectors.categoryFacet);
    cy.wait('@coveoAnalytics');
  });

  it('Should load, pass accessibility test, have correct label, and facetCount', () => {
    validateFacetComponentLoaded(
      categoryFacetProp.label,
      FacetSelectors.categoryFacet
    );
  });
  //temporary checking like this before setting up the source
  it('Should send custom delimiting character to api', () => {
    cy.wait('@coveoSearch').then((intercept) => {
      const firstRequestBodyFacets = (intercept.request.body.facets as any)[0];

      expect(firstRequestBodyFacets).to.have.property(
        'delimitingCharacter',
        delimitingCharacter
      );
    });
  });
});

describe('Category Facet with custom sortCriteria', () => {
  const customSort = 'alphanumeric';
  beforeEach(() => {
    setupCategoryFacet(
      categoryFacetProp.field,
      categoryFacetProp.label,
      `sort-criteria=${customSort}`
    );
    createAliasShadow(categoryFacetProp.field, FacetSelectors.categoryFacet);
    createAliasFacetUL(categoryFacetProp.field, FacetSelectors.categoryFacet);
    cy.wait('@coveoAnalytics');
  });

  it('Should load, pass accessibility test, have correct label, and facetCount', () => {
    validateFacetComponentLoaded(
      categoryFacetProp.label,
      FacetSelectors.categoryFacet
    );
  });

  it('Should display facetValue in correct sort order', () => {
    cy.getTextOfAllElements(FacetAlias.facetAllValueLabel).then(
      (originalValues) => {
        expect(originalValues).to.eql(doSortAlphanumeric(originalValues));
      }
    );
  });
});

describe('Category Facet with invalid option', () => {
  describe('Facet with invalid field', () => {
    it('Should render an error when field is invalid', () => {
      setupCategoryFacet('@test', categoryFacetProp.label);
      shouldRenderErrorComponent(FacetSelectors.categoryFacet);
    });

    it('Should not render when field returns no result', () => {
      setupCategoryFacet('test', categoryFacetProp.label);
      validateFacetComponentVisible(
        categoryFacetProp.label,
        FacetSelectors.categoryFacet
      );
    });
  });

  describe('Facet with invalid numberOfValues', () => {
    it('Should render an error when the prop is not in the list of numberOfValues', () => {
      setupCategoryFacet(
        categoryFacetProp.field,
        categoryFacetProp.label,
        'number-of-values=-5'
      );
      shouldRenderErrorComponent(FacetSelectors.categoryFacet);
    });

    it('Should render an error when the prop is not a number ', () => {
      setupCategoryFacet(
        categoryFacetProp.field,
        categoryFacetProp.label,
        'number-of-values="here"'
      );
      shouldRenderErrorComponent(FacetSelectors.categoryFacet);
    });
  });

  describe('Facet with invalid sort criteria', () => {
    it('Should render an error when the prop is not in the list of sortCriteria', () => {
      setupCategoryFacet(
        categoryFacetProp.field,
        categoryFacetProp.label,
        'sort-criteria=test'
      );
      shouldRenderErrorComponent(FacetSelectors.categoryFacet);
    });
  });
});

describe('When URL contains a selected path of category facet', () => {
  it('Category Facet should load with correct path', () => {
    cy.visit(
      'http://localhost:3333/pages/test.html#cf[geographicalhierarchy]=North%20America,Canada,Alberta'
    );
    injectComponent(`
    <atomic-breadcrumb-manager></atomic-breadcrumb-manager>    
    <atomic-category-facet field="${categoryFacetProp.field}" label="${categoryFacetProp.label}"></atomic-category-facet>`);
    createAliasShadow(categoryFacetProp.field, FacetSelectors.categoryFacet);
    assertClearAllTitleAndTotalParents(
      categoryFacetProp.defaultCategoryLabel,
      3
    );
    cy.get(FacetAlias.facetShadow)
      .find('ul[part="parents"]')
      .find('li')
      .last()
      .find('b')
      .contains('Alberta');
  });
});
