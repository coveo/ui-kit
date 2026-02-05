import {Schema, StringValue} from '@coveo/bueno';
import {
  buildInteractiveResult as buildInsightInteractiveResult,
  buildResultList as buildInsightResultList,
  buildResultsPerPage as buildInsightResultsPerPage,
  type Result as InsightResult,
  type ResultList as InsightResultList,
  type ResultListState as InsightResultListState,
  type ResultsPerPage as InsightResultsPerPage,
  type ResultsPerPageState as InsightResultsPerPageState,
} from '@coveo/headless/insight';
import {type CSSResultGroup, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {keyed} from 'lit/directives/keyed.js';
import {map} from 'lit/directives/map.js';
import {ref} from 'lit/directives/ref.js';
import {when} from 'lit/directives/when.js';
import {renderItemPlaceholders} from '@/src/components/common/atomic-result-placeholder/item-placeholders';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderDisplayWrapper} from '@/src/components/common/item-list/display-wrapper';
import {renderItemList} from '@/src/components/common/item-list/item-list';
import {
  ItemListCommon,
  type ItemRenderingFunction,
} from '@/src/components/common/item-list/item-list-common';
import {ResultTemplateProvider} from '@/src/components/common/item-list/result-template-provider';
import listDisplayStyles from '@/src/components/common/item-list/styles/list-display.tw.css';
import placeholderStyles from '@/src/components/common/item-list/styles/placeholders.tw.css';
import {
  getItemListDisplayClasses,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
  type ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {InsightBindings} from '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {ChildrenUpdateCompleteMixin} from '@/src/mixins/children-update-complete-mixin';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {randomID} from '@/src/utils/utils';
import '@/src/components/insight/atomic-insight-result/atomic-insight-result';
import '@/src/components/insight/atomic-insight-result-template/atomic-insight-result-template';

/**
 * The `atomic-insight-result-list` component is responsible for displaying insight query results by applying one or more result templates.
 *
 * @slot default - The default slot where the result templates are inserted.
 * @part result-list - The element containing every result of a result list
 * @part outline - The element displaying an outline or a divider around a result
 */
@customElement('atomic-insight-result-list')
@bindings()
@withTailwindStyles
export class AtomicInsightResultList
  extends ChildrenUpdateCompleteMixin(LitElement)
  implements InitializableComponent<InsightBindings>
{
  static styles: CSSResultGroup = [placeholderStyles, listDisplayStyles];

  private static readonly propsSchema = new Schema({
    density: new StringValue({
      constrainTo: ['normal', 'comfortable', 'compact'],
    }),
    imageSize: new StringValue({
      constrainTo: ['small', 'large', 'icon', 'none'],
    }),
  });

  public resultList!: InsightResultList;
  public resultsPerPage!: InsightResultsPerPage;

  private itemRenderingFunction: ItemRenderingFunction;
  private loadingFlag = randomID('firstInsightResultLoaded-');
  private nextNewResultTarget?: FocusTargetController;
  private resultListCommon!: ItemListCommon;
  private resultTemplateProvider!: ResultTemplateProvider;
  private readonly display: ItemDisplayLayout = 'list';

  @state()
  bindings!: InsightBindings;
  @state()
  error!: Error;
  @state()
  private isAppLoaded = false;
  @state()
  private isEveryResultReady = false;
  @state()
  private resultTemplateRegistered = false;
  @state()
  private templateHasError = false;

  @bindStateToController('resultList')
  @state()
  private resultListState!: InsightResultListState;

  @bindStateToController('resultsPerPage')
  @state()
  private resultsPerPageState!: InsightResultsPerPageState;

  /**
   * The spacing of various elements in the result list, including the gap between results, the gap between parts of a result, and the font sizes of different parts in a result.
   */
  @property({reflect: true, type: String})
  public density: ItemDisplayDensity = 'normal';

  /**
   * The expected size of the image displayed in the results.
   */
  @property({reflect: true, attribute: 'image-size', type: String})
  public imageSize: ItemDisplayImageSize = 'icon';

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        density: this.density,
        imageSize: this.imageSize,
      }),
      AtomicInsightResultList.propsSchema
    );
  }

  /**
   * Sets a rendering function to bypass the standard HTML template mechanism for rendering results.
   * You can use this function while working with web frameworks that don't use plain HTML syntax such as React, Angular, or Vue.
   *
   * Do not use this method if you integrate Atomic in a plain HTML deployment.
   *
   * @param resultRenderingFunction
   */
  public async setRenderFunction(
    resultRenderingFunction: ItemRenderingFunction
  ) {
    this.itemRenderingFunction = resultRenderingFunction;
  }

  public initialize() {
    this.resultList = buildInsightResultList(this.bindings.engine, {
      options: {
        fieldsToInclude: this.bindings.store.state.fieldsToInclude || undefined,
      },
    });
    this.resultsPerPage = buildInsightResultsPerPage(this.bindings.engine);

    this.initResultTemplateProvider();
    this.initResultListCommon();

    createAppLoadedListener(this.bindings.store, (isAppLoaded) => {
      this.isAppLoaded = isAppLoaded;
    });
  }

  public async willUpdate(changedProperties: Map<string, unknown>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('resultListState')) {
      const oldState = changedProperties.get(
        'resultListState'
      ) as InsightResultListState;
      if (this.resultListState.firstSearchExecuted) {
        this.bindings.store.unsetLoadingFlag(this.loadingFlag);
      }
      if (!oldState?.isLoading && this.resultListState.isLoading) {
        this.isEveryResultReady = false;
      }
    }

    await this.updateResultReadyState();
  }

  private async updateResultReadyState() {
    if (
      this.isAppLoaded &&
      !this.isEveryResultReady &&
      this.resultListState?.firstSearchExecuted &&
      this.resultListState?.results?.length > 0
    ) {
      await this.getUpdateComplete();
      this.isEveryResultReady = true;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${renderItemList({
      props: {
        hasError: this.resultListState.hasError,
        hasItems: this.resultListState.hasResults,
        hasTemplate: this.resultTemplateRegistered,
        firstRequestExecuted: this.resultListState.firstSearchExecuted,
        templateHasError: this.templateHasError,
      },
    })(
      html`${when(
        this.templateHasError,
        () => html`<slot></slot>`,
        () => {
          this.resultListCommon.updateBreakpoints();
          const listClasses = this.computeListDisplayClasses();
          const resultClasses = `${listClasses} ${!this.isEveryResultReady && 'hidden'}`;

          // Results must be rendered immediately (though hidden) to start their initialization and loading processes.
          // If we wait to render results until placeholders are removed, the components won't begin loading until then,
          // causing a longer delay. The `isEveryResultReady` flag hides results while preserving placeholders,
          // then removes placeholders once results are fully loaded to prevent content flash.
          return html`
            ${when(this.isAppLoaded, () =>
              renderDisplayWrapper({
                props: {listClasses: resultClasses, display: this.display},
              })(html`${this.renderList()}`)
            )}
            ${when(!this.isEveryResultReady, () =>
              renderDisplayWrapper({
                props: {listClasses, display: this.display},
              })(
                renderItemPlaceholders({
                  props: {
                    density: this.density,
                    display: this.display,
                    imageSize: this.imageSize,
                    numberOfPlaceholders:
                      this.resultsPerPageState.numberOfResults || 10,
                  },
                })
              )
            )}
          `;
        }
      )}`
    )}`;
  }

  private initResultTemplateProvider() {
    this.resultTemplateProvider = new ResultTemplateProvider({
      includeDefaultTemplate: true,
      templateElements: Array.from(
        this.querySelectorAll('atomic-insight-result-template')
      ),
      getResultTemplateRegistered: () => this.resultTemplateRegistered,
      getTemplateHasError: () => this.templateHasError,
      setResultTemplateRegistered: (value: boolean) => {
        this.resultTemplateRegistered = value;
      },
      setTemplateHasError: (value: boolean) => {
        this.templateHasError = value;
      },
      bindings: this.bindings,
    });
  }

  private initResultListCommon() {
    this.resultListCommon = new ItemListCommon({
      engineSubscribe: this.bindings.engine.subscribe,
      getCurrentNumberOfItems: () => this.resultListState.results.length,
      getIsLoading: () => this.resultListState.isLoading,
      host: this,
      loadingFlag: this.loadingFlag,
      nextNewItemTarget: this.focusTarget,
      store: this.bindings.store,
    });
  }

  private computeListDisplayClasses() {
    const displayPlaceholders = !(this.isAppLoaded && this.isEveryResultReady);

    return getItemListDisplayClasses(
      this.display,
      this.density,
      this.imageSize,
      this.resultListState?.isLoading,
      displayPlaceholders
    );
  }

  private renderList() {
    return html`${map(this.resultListState.results, (result, index) => {
      return html`${keyed(
        this.getResultId(result),
        html`<atomic-insight-result
          part="outline"
          ${ref(
            (element) =>
              element instanceof HTMLElement &&
              this.resultListCommon.setNewResultRef(element, index)
          )}
          .content=${this.resultTemplateProvider.getTemplateContent(result)}
          .density=${this.density}
          .display=${this.display}
          .imageSize=${this.imageSize}
          .interactiveResult=${this.getInteractiveResult(result)}
          .loadingFlag=${this.loadingFlag}
          .result=${result}
          .renderingFunction=${this.itemRenderingFunction}
          .store=${this.bindings.store as never}
        ></atomic-insight-result>`
      )}`;
    })}`;
  }

  private get focusTarget() {
    if (!this.nextNewResultTarget) {
      this.nextNewResultTarget = new FocusTargetController(this, this.bindings);
    }
    return this.nextNewResultTarget;
  }

  private getInteractiveResult(result: InsightResult) {
    return buildInsightInteractiveResult(this.bindings.engine, {
      options: {result},
    });
  }

  private getResultId(result: InsightResult) {
    return this.resultListCommon.getResultId(
      result.uniqueId,
      this.resultListState.searchResponseId,
      this.density,
      this.imageSize
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-result-list': AtomicInsightResultList;
  }
}
