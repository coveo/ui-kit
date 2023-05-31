import {ResultListSelectors} from '../result-list-selectors';

export const quickviewComponent = 'atomic-quickview';
export const quickviewModalComponent = 'atomic-quickview-modal';
export const focusTrapComponent = 'atomic-focus-trap';

export const QuickviewSelectors = {
  shadow: () => cy.get(quickviewComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(quickviewComponent),
  button: () => QuickviewSelectors.firstInResult().shadow().find('button'),
};

export const QuickviewModalSelectors = {
  shadow: () => cy.get(quickviewModalComponent).shadow(),
  focusTrap: () =>
    QuickviewModalSelectors.shadow().find(focusTrapComponent, {
      includeShadowDom: true,
    }),
  focusTrapContainer: () =>
    QuickviewModalSelectors.focusTrap().shadow().find('[part="container"]'),
  header: () => QuickviewModalSelectors.shadow().find('[slot="header"]'),
  body: () => QuickviewModalSelectors.shadow().find('[slot="body"]'),
  footer: () => QuickviewModalSelectors.shadow().find('[slot="footer"]'),
  closeButton: () => QuickviewModalSelectors.header().find('button'),
  titleLink: () => QuickviewModalSelectors.header().find('a'),
  iframe: () => QuickviewModalSelectors.body().find('iframe'),
  pagerSummary: () => QuickviewModalSelectors.footer().find('p'),
  nextButton: () => QuickviewModalSelectors.footer().find('button').eq(1),
  previousButton: () => QuickviewModalSelectors.footer().find('button').eq(0),
  keywordsHighlightToggleButton: () =>
    QuickviewModalSelectors.body().find(
      'button[id="atomic-quickview-sidebar-highlight-keywords"]'
    ),
  keywordsSidebar: () =>
    QuickviewModalSelectors.body().find(
      '[id="coveo-quickview-sidebar-keywords"]'
    ),
  keywordsMinimizeButton: () =>
    QuickviewModalSelectors.body()
      .find('[part="sidebar-minimize-container"]')
      .find('button'),
};
