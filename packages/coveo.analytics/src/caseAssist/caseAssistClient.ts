import CoveoAnalyticsClient, {AnalyticsClient, ClientOptions} from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';
import doNotTrack from '../donottrack';
import {ClickEventRequest} from '../events';
import {SVCPlugin} from '../plugins/svc';
import {DocumentIdentifier, PartialDocumentInformation, SearchPageEvents} from '../searchPage/searchPageEvents';
import {
    CaseAssistActions,
    CaseAssistEvents,
    CaseCancelledMetadata,
    CaseCancelledReasons,
    CaseCreatedMetadata,
    CaseSolvedMetadata,
    EnterInterfaceMetadata,
    MoveToNextCaseStepMetadata,
    RateDocumentSuggestionMetadata,
    SelectDocumentSuggestionMetadata,
    SelectFieldSuggestionMetadata,
    UpdateCaseFieldMetadata,
} from './caseAssistActions';

export interface CaseAssistClientProvider {
    getOriginLevel1: () => string;
    getOriginLevel2: () => string;
    getOriginLevel3: () => string;
    getOriginContext: () => string;
    getIsAnonymous: () => boolean;
    getSearchUID: () => string;
    getLanguage: () => string;
}

export interface CaseAssistClientOptions extends ClientOptions {
    enableAnalytics?: boolean;
}

export class CaseAssistClient {
    public coveoAnalyticsClient: AnalyticsClient;
    private svc: SVCPlugin;

    constructor(private options: Partial<CaseAssistClientOptions>, private provider?: CaseAssistClientProvider) {
        const analyticsEnabled = (options.enableAnalytics ?? true) && !doNotTrack();

        this.coveoAnalyticsClient = analyticsEnabled ? new CoveoAnalyticsClient(options) : new NoopAnalytics();
        this.svc = new SVCPlugin({client: this.coveoAnalyticsClient});
    }

    public disable() {
        this.coveoAnalyticsClient = new NoopAnalytics();
        this.svc = new SVCPlugin({client: this.coveoAnalyticsClient});
    }

    public enable() {
        this.coveoAnalyticsClient = new CoveoAnalyticsClient(this.options);
        this.svc = new SVCPlugin({client: this.coveoAnalyticsClient});
    }

    public logEnterInterface(meta: EnterInterfaceMetadata) {
        this.svc.setAction(CaseAssistActions.enterInterface);
        this.svc.setTicket(meta.ticket);
        return this.sendFlowStartEvent();
    }

    public logUpdateCaseField(meta: UpdateCaseFieldMetadata) {
        this.svc.setAction(CaseAssistActions.fieldUpdate, {
            fieldName: meta.fieldName,
        });
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logSelectFieldSuggestion(meta: SelectFieldSuggestionMetadata) {
        this.svc.setAction(CaseAssistActions.fieldSuggestionClick, meta.suggestion);
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logSelectDocumentSuggestion(meta: SelectDocumentSuggestionMetadata) {
        return this.logClickEvent(CaseAssistActions.documentSuggestionClick, meta.suggestion.suggestion, {
            contentIDKey: 'permanentId',
            contentIDValue: meta.suggestion.permanentId,
        });
    }

    public logQuickviewDocumentSuggestion(meta: SelectDocumentSuggestionMetadata) {
        return this.logClickEvent(CaseAssistActions.documentSuggestionQuickview, meta.suggestion.suggestion, {
            contentIDKey: 'permanentId',
            contentIDValue: meta.suggestion.permanentId,
        });
    }

    public logRateDocumentSuggestion(meta: RateDocumentSuggestionMetadata) {
        this.svc.setAction(CaseAssistActions.suggestionRate, {
            rate: meta.rating,
            ...meta.suggestion,
        });
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logMoveToNextCaseStep(meta: MoveToNextCaseStepMetadata) {
        this.svc.setAction(CaseAssistActions.nextCaseStep, {
            stage: meta?.stage,
        });
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logCaseCancelled(meta: CaseCancelledMetadata) {
        this.svc.setAction(CaseAssistActions.caseCancelled, {
            reason: CaseCancelledReasons.quit,
        });
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logCaseSolved(meta: CaseSolvedMetadata) {
        this.svc.setAction(CaseAssistActions.caseSolved, {
            reason: CaseCancelledReasons.solved,
        });
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logCaseCreated(meta: CaseCreatedMetadata) {
        this.svc.setAction(CaseAssistActions.caseCreated);
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    private sendFlowStartEvent() {
        return this.coveoAnalyticsClient.sendEvent(
            'event',
            'svc',
            CaseAssistEvents.flowStart,
            this.provider
                ? {
                      searchHub: this.provider.getOriginLevel1(),
                  }
                : null
        );
    }

    private sendClickEvent() {
        return this.coveoAnalyticsClient.sendEvent(
            'event',
            'svc',
            CaseAssistEvents.click,
            this.provider
                ? {
                      searchHub: this.provider.getOriginLevel1(),
                  }
                : null
        );
    }

    private async getBaseEventRequest(metadata?: Record<string, any>) {
        const customData = {...metadata};
        return {
            ...this.getOrigins(),
            customData,
            language: this.provider?.getLanguage(),
            anonymous: this.provider?.getIsAnonymous(),
            clientId: await this.getClientId(),
        };
    }

    private getClientId() {
        return this.coveoAnalyticsClient instanceof CoveoAnalyticsClient
            ? this.coveoAnalyticsClient.getCurrentVisitorId()
            : undefined;
    }

    private getOrigins() {
        return {
            originContext: this.provider?.getOriginContext?.(),
            originLevel1: this.provider?.getOriginLevel1(),
            originLevel2: this.provider?.getOriginLevel2(),
            originLevel3: this.provider?.getOriginLevel3(),
        };
    }

    private async logClickEvent(
        event: CaseAssistActions,
        info: PartialDocumentInformation,
        identifier: DocumentIdentifier,
        metadata?: Record<string, any>
    ) {
        const payload: ClickEventRequest = {
            ...info,
            ...(await this.getBaseEventRequest({...identifier, ...metadata})),
            searchQueryUid: this.provider?.getSearchUID() ?? '',
            actionCause: event,
        };

        return this.coveoAnalyticsClient.sendClickEvent(payload);
    }
}
