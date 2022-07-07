import CoveoAnalyticsClient, {AnalyticsClient, ClientOptions} from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';
import doNotTrack from '../donottrack';
import {CustomEventRequest, SearchEventRequest} from '../events';
import {
    CustomEventsTypes,
    FacetBaseMeta,
    FacetMetadata,
    FacetSortMeta,
    FacetStateMetadata,
    PagerMetadata,
    InterfaceChangeMetadata,
    QueryErrorMeta,
    SearchPageEvents,
    ResultsSortMetadata,
} from '../searchPage/searchPageEvents';

export interface InsightClientProvider {
    getSearchEventRequestPayload: () => Omit<SearchEventRequest, 'actionCause' | 'searchQueryUid'>;
    getSearchUID: () => string;
    getBaseMetadata: () => Record<string, any>;
    getPipeline: () => string;
    getOriginContext?: () => string;
    getOriginLevel1: () => string;
    getOriginLevel2: () => string;
    getOriginLevel3: () => string;
    getLanguage: () => string;
    getIsAnonymous: () => boolean;
    getFacetState?: () => FacetStateMetadata[];
}

export interface InsightClientOptions extends ClientOptions {
    enableAnalytics: boolean;
}

export class CoveoInsightClient {
    public coveoAnalyticsClient: AnalyticsClient;

    constructor(private opts: Partial<InsightClientOptions>, private provider: InsightClientProvider) {
        const shouldDisableAnalytics = opts.enableAnalytics === false || doNotTrack();
        this.coveoAnalyticsClient = shouldDisableAnalytics ? new NoopAnalytics() : new CoveoAnalyticsClient(opts);
    }

    public disable() {
        if (this.coveoAnalyticsClient instanceof CoveoAnalyticsClient) {
            this.coveoAnalyticsClient.clear();
        }
        this.coveoAnalyticsClient = new NoopAnalytics();
    }

    public enable() {
        this.coveoAnalyticsClient = new CoveoAnalyticsClient(this.opts);
    }

    public logInterfaceLoad() {
        return this.logSearchEvent(SearchPageEvents.interfaceLoad);
    }

    public logInterfaceChange(metadata: InterfaceChangeMetadata) {
        return this.logSearchEvent(SearchPageEvents.interfaceChange, metadata);
    }

    public logFetchMoreResults() {
        return this.logCustomEvent(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
    }

    public logFacetSelect(meta: FacetMetadata) {
        return this.logSearchEvent(SearchPageEvents.facetSelect, meta);
    }

    public logFacetDeselect(meta: FacetMetadata) {
        return this.logSearchEvent(SearchPageEvents.facetDeselect, meta);
    }

    public logFacetUpdateSort(meta: FacetSortMeta) {
        return this.logSearchEvent(SearchPageEvents.facetUpdateSort, meta);
    }

    public logFacetClearAll(meta: FacetBaseMeta) {
        return this.logSearchEvent(SearchPageEvents.facetClearAll, meta);
    }

    public logFacetShowMore(meta: FacetBaseMeta) {
        return this.logCustomEvent(SearchPageEvents.facetShowMore, meta);
    }

    public logFacetShowLess(meta: FacetBaseMeta) {
        return this.logCustomEvent(SearchPageEvents.facetShowLess, meta);
    }

    public logQueryError(meta: QueryErrorMeta) {
        return this.logCustomEvent(SearchPageEvents.queryError, meta);
    }

    public async logCustomEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};

        const payload: CustomEventRequest = {
            ...(await this.getBaseCustomEventRequest(customData)),
            eventType: CustomEventsTypes[event]!,
            eventValue: event,
        };

        return this.coveoAnalyticsClient.sendCustomEvent(payload);
    }

    public async logSearchEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        return this.coveoAnalyticsClient.sendSearchEvent(await this.getBaseSearchEventRequest(event, metadata));
    }

    public logPagerNumber(meta: PagerMetadata) {
        return this.logCustomEvent(SearchPageEvents.pagerNumber, meta);
    }

    public logPagerNext(meta: PagerMetadata) {
        return this.logCustomEvent(SearchPageEvents.pagerNext, meta);
    }

    public logPagerPrevious(meta: PagerMetadata) {
        return this.logCustomEvent(SearchPageEvents.pagerPrevious, meta);
    }

    public logResultsSort(metadata: ResultsSortMetadata) {
        return this.logSearchEvent(SearchPageEvents.resultsSort, metadata);
    }

    private async getBaseCustomEventRequest(metadata?: Record<string, any>) {
        return {
            ...(await this.getBaseEventRequest(metadata)),
            lastSearchQueryUid: this.provider.getSearchUID(),
        };
    }

    private async getBaseSearchEventRequest(
        event: SearchPageEvents,
        metadata?: Record<string, any>
    ): Promise<SearchEventRequest> {
        return {
            ...(await this.getBaseEventRequest(metadata)),
            ...this.provider.getSearchEventRequestPayload(),
            searchQueryUid: this.provider.getSearchUID(),
            queryPipeline: this.provider.getPipeline(),
            actionCause: event,
        };
    }

    private async getBaseEventRequest(metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};
        return {
            ...this.getOrigins(),
            customData,
            language: this.provider.getLanguage(),
            facetState: this.provider.getFacetState ? this.provider.getFacetState() : [],
            anonymous: this.provider.getIsAnonymous(),
            clientId: await this.getClientId(),
        };
    }

    private getOrigins() {
        return {
            originContext: this.provider.getOriginContext?.(),
            originLevel1: this.provider.getOriginLevel1(),
            originLevel2: this.provider.getOriginLevel2(),
            originLevel3: this.provider.getOriginLevel3(),
        };
    }

    private getClientId() {
        return this.coveoAnalyticsClient instanceof CoveoAnalyticsClient
            ? this.coveoAnalyticsClient.getCurrentVisitorId()
            : undefined;
    }
}
