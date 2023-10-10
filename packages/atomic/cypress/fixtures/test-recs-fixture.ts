import {i18n} from 'i18next';
import {buildTestUrl} from '../utils/setupComponent';
import {
  ConsoleAliases,
  getUABody,
  getUACustomData,
  interceptSearchAndReturnError,
  modifySearchResponses,
  RouteAlias,
  sampleConfig,
  setupIntercept,
  spyConsole,
  UrlParts,
  TestFeature,
  SearchResponseModifier,
  SearchResponseModifierPredicate,
  configureI18n,
  interceptAnalytics,
} from './fixture-common';

export type RecsInterface = HTMLElement & {
  initialize: (opts: {
    accessToken: string;
    organizationId: string;
  }) => Promise<void>;
  getRecommendations: () => void;
  i18n: i18n;
  language: string;
};

export class TestRecsFixture {
  private aliases: TestFeature<TestRecsFixture>[] = [];
  private firstIntercept = true;
  private getRecs = true;
  private initializeInterface = true;
  private recsInterface = document.createElement(
    'atomic-recs-interface'
  ) as RecsInterface;
  private style = document.createElement('style');
  private language?: string;
  private disabledAnalytics = false;
  private fieldCaptions: {field: string; captions: Record<string, string>}[] =
    [];
  private translations: Record<string, string> = {};
  private responseModifiers: SearchResponseModifier[] = [];
  private returnError = false;

  public static interceptAliases = RouteAlias;
  public static urlParts = UrlParts;
  public static consoleAliases = ConsoleAliases;
  public static getUABody = getUABody;
  public static getUACustomData = getUACustomData;

  public with(feat: TestFeature<TestRecsFixture>) {
    feat(this);
    return this;
  }

  public withoutInterfaceInitialization() {
    this.withoutGetRecommendations();
    this.initializeInterface = false;
    return this;
  }

  public withoutGetRecommendations() {
    this.getRecs = false;
    return this;
  }
  public withoutFirstIntercept() {
    this.firstIntercept = false;
    return this;
  }

  public withElement(e: HTMLElement) {
    this.recsInterface.append(e);
    return this;
  }

  public withAlias(aliasFn: TestFeature<TestRecsFixture>) {
    this.aliases.push(aliasFn);
    return this;
  }

  public withStyle(e: string) {
    this.style.append(e);
    return this;
  }

  public withLanguage(lang: string) {
    this.language = lang;
    return this;
  }

  public withoutAnalytics() {
    this.disabledAnalytics = true;
    return this;
  }

  public withFieldCaptions(field: string, captions: Record<string, string>) {
    this.fieldCaptions.push({field, captions});
    return this;
  }

  public withTranslation(translations: Record<string, string>) {
    this.translations = {
      ...this.translations,
      ...translations,
    };
    return this;
  }

  public withCustomResponse(
    predicate: SearchResponseModifierPredicate,
    times = 9999
  ) {
    this.responseModifiers.push({predicate, times});
    return this;
  }

  public withNoRecs() {
    return this.withCustomResponse((r) => {
      r.results = [];
      r.totalCountFiltered = 0;
      return r;
    });
  }

  public withError() {
    this.returnError = true;
    return this;
  }

  public withViewport(viewport: Cypress.ViewportPreset) {
    cy.viewport(viewport);
    return this;
  }

  public withMobileViewport() {
    return this.withViewport('iphone-x');
  }

  public init() {
    cy.visit(buildTestUrl());
    cy.injectAxe();
    setupIntercept();
    spyConsole();

    cy.document().then((doc) => {
      doc.head.appendChild(this.style);
      doc.body.appendChild(this.recsInterface);
    });

    cy.get('atomic-recs-interface').then(($si) => {
      const recsInterfaceComponent = $si.get()[0] as RecsInterface;

      if (this.language) {
        recsInterfaceComponent.setAttribute('language', this.language);
      }

      if (this.disabledAnalytics) {
        recsInterfaceComponent.setAttribute('analytics', 'false');
      } else {
        interceptAnalytics();
      }

      if (this.responseModifiers.length) {
        modifySearchResponses(this.responseModifiers);
      }

      if (this.returnError) {
        interceptSearchAndReturnError();
      }

      if (!this.initializeInterface) {
        return;
      }

      recsInterfaceComponent.initialize(sampleConfig).then(() => {
        configureI18n(
          recsInterfaceComponent.i18n,
          this.translations,
          this.fieldCaptions
        );
        if (this.getRecs) {
          recsInterfaceComponent.getRecommendations();
        }
      });
    });

    if (this.getRecs && this.firstIntercept) {
      cy.wait(TestRecsFixture.interceptAliases.Search);
      if (!this.disabledAnalytics) {
        cy.wait(TestRecsFixture.interceptAliases.UA);
      }
    }

    this.aliases.forEach((alias) => alias(this));

    return this;
  }
}
