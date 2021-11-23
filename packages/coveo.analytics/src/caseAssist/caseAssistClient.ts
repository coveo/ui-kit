import CoveoAnalyticsClient, {AnalyticsClient, ClientOptions} from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';
import {SVCPlugin} from '../plugins/svc';
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

export interface CaseAssistClientOptions extends ClientOptions {
    enableAnalytics: boolean;
}

export class CaseAssistClient {
    public coveoAnalyticsClient: AnalyticsClient;
    private svc: SVCPlugin;

    constructor(private options: Partial<CaseAssistClientOptions>) {
        this.coveoAnalyticsClient = options.enableAnalytics ? new CoveoAnalyticsClient(options) : new NoopAnalytics();
        this.svc = new SVCPlugin({client: this.coveoAnalyticsClient});
    }

    public disable() {
        if (this.coveoAnalyticsClient instanceof CoveoAnalyticsClient) {
            this.coveoAnalyticsClient.clear();
        }
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
        this.svc.setAction(CaseAssistActions.suggestionClick, meta.suggestion);
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
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
        this.svc.setAction(CaseAssistActions.nextCaseStep);
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
        return this.coveoAnalyticsClient.sendEvent('event', 'svc', CaseAssistEvents.flowStart);
    }

    private sendClickEvent() {
        return this.coveoAnalyticsClient.sendEvent('event', 'svc', CaseAssistEvents.click);
    }
}
