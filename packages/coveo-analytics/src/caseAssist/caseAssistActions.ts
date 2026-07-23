import {TicketProperties} from '../plugins/svc';

export enum CaseAssistEvents {
    click = 'click',
    flowStart = 'flowStart',
}

export enum CaseAssistActions {
    enterInterface = 'ticket_create_start',
    fieldUpdate = 'ticket_field_update',
    fieldSuggestionClick = 'ticket_classification_click',
    suggestionClick = 'suggestion_click',
    suggestionRate = 'suggestion_rate',
    nextCaseStep = 'ticket_next_stage',
    caseCancelled = 'ticket_cancel',
    caseSolved = 'ticket_cancel',
    caseCreated = 'ticket_create',
}

export enum CaseCancelledReasons {
    quit = 'Quit',
    solved = 'Solved',
}

export interface EnterInterfaceMetadata {
    ticket: TicketProperties;
}

export interface UpdateCaseFieldMetadata {
    fieldName: string;
    ticket: TicketProperties;
}

export interface SelectFieldSuggestionMetadata {
    suggestion: FieldSuggestion;
    ticket: TicketProperties;
}

export interface SelectDocumentSuggestionMetadata {
    suggestion: DocumentSuggestion;
    ticket: TicketProperties;
}

export interface RateDocumentSuggestionMetadata {
    rating: number;
    suggestion: DocumentSuggestion;
    ticket: TicketProperties;
}

export interface MoveToNextCaseStepMetadata {
    ticket: TicketProperties;
    stage?: string;
}

export interface CaseCancelledMetadata {
    ticket: TicketProperties;
}

export interface CaseSolvedMetadata {
    ticket: TicketProperties;
}

export interface CaseCreatedMetadata {
    ticket: TicketProperties;
}

export interface FieldSuggestion {
    classificationId: string;
    responseId: string;
    fieldName: string;
    classification: {
        value: string;
        confidence: number;
    };
    autoSelection?: boolean;
}

export interface DocumentSuggestion {
    suggestionId: string;
    responseId: string;
    suggestion: {
        documentUri: string;
        documentUriHash: string;
        documentTitle: string;
        documentUrl: string;
        documentPosition: number;
    };
    fromQuickview?: boolean;
    openDocument?: boolean;
}
