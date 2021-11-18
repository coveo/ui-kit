import CoveoAnalyticsClient, {AnalyticsClient, ClientOptions} from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';
import {SVCPlugin} from '../plugins/svc';
import {
    CaseCancelledMetadata,
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
    private client: AnalyticsClient;
    private svc: SVCPlugin;

    constructor(private options: Partial<CaseAssistClientOptions>) {
        this.client = options.enableAnalytics === false ? new NoopAnalytics() : new CoveoAnalyticsClient(options);
        this.svc = new SVCPlugin({client: this.client});
    }

    public disable() {
        if (this.client instanceof CoveoAnalyticsClient) {
            this.client.clear();
        }
        this.client = new NoopAnalytics();
        this.svc = new SVCPlugin({client: this.client});
    }

    public enable() {
        this.client = new CoveoAnalyticsClient(this.options);
        this.svc = new SVCPlugin({client: this.client});
    }

    public logEnterInterface(meta: EnterInterfaceMetadata) {
        this.svc.setAction('ticket_create_start');
        this.svc.setTicket(meta.ticket);
        return this.sendFlowStartEvent();
    }

    public logUpdateCaseField(meta: UpdateCaseFieldMetadata) {
        this.svc.setAction('ticket_field_update', {
            fieldName: meta.fieldName,
        });
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logSelectFieldSuggestion(meta: SelectFieldSuggestionMetadata) {
        this.svc.setAction('ticket_classification_click', meta.suggestion);
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logSelectDocumentSuggestion(meta: SelectDocumentSuggestionMetadata) {
        this.svc.setAction('suggestion_click', meta.suggestion);
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logRateDocumentSuggestion(meta: RateDocumentSuggestionMetadata) {
        this.svc.setAction('suggestion_rate', {
            rate: meta.rating,
            ...meta.suggestion,
        });
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logMoveToNextCaseStep(meta: MoveToNextCaseStepMetadata) {
        this.svc.setAction('ticket_next_stage');
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logCaseCancelled(meta: CaseCancelledMetadata) {
        this.svc.setAction('ticket_cancel', {
            reason: 'Quit',
        });
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logCaseSolved(meta: CaseSolvedMetadata) {
        this.svc.setAction('ticket_cancel', {
            reason: 'Solved',
        });
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    public logCaseCreated(meta: CaseCreatedMetadata) {
        this.svc.setAction('ticket_create');
        this.svc.setTicket(meta.ticket);
        return this.sendClickEvent();
    }

    private sendFlowStartEvent() {
        return this.client.sendEvent('event', 'svc', 'flowStart');
    }

    private sendClickEvent() {
        return this.client.sendEvent('event', 'svc', 'click');
    }
}
