import {CaseAssistClient, CaseAssistClientProvider} from './caseAssistClient';
import {
    CaseAssistActions,
    CaseAssistEvents,
    CaseCancelledReasons,
    DocumentSuggestion,
    FieldSuggestion,
} from './caseAssistActions';
import {mockFetch, lastCallBody} from '../../tests/fetchMock';
import {TicketProperties} from '../plugins/svc';
const {fetchMock, fetchMockBeforeEach} = mockFetch();
import doNotTrack from '../donottrack';
import {Cookie} from '../cookieutils';
jest.mock('../donottrack', () => {
    return {
        default: jest.fn(),
        doNotTrack: jest.fn(),
    };
});

describe('CaseAssistClient', () => {
    const defaultSearchHub = 'origin-level-1';
    let client: CaseAssistClient;

    const provider: CaseAssistClientProvider = {
        getOriginLevel1: () => defaultSearchHub,
    };

    beforeEach(() => {
        fetchMockBeforeEach();

        client = initClient();
        fetchMock.mock(/.*/, {
            visitorId: 'visitor-id',
        });
    });

    afterEach(() => {
        fetchMock.reset();
    });

    const initClient = () => {
        return new CaseAssistClient(
            {
                enableAnalytics: true,
            },
            provider
        );
    };

    const noTicket: Record<string, unknown> = undefined;
    const noActionData: Record<string, unknown> = undefined;
    const emptyTicket: TicketProperties = {};

    const fakeTicket: TicketProperties = {
        id: 'the-ticket-id',
        subject: 'the ticket subject',
        description: 'the ticket description',
        category: 'ticket-category',
        productId: 'some-product-id',
        custom: {
            customA: 'custom-a-value',
            customB: 'custom-b-value',
        },
    };

    const fakeFieldSuggestion = (): FieldSuggestion => {
        return {
            classification: {
                value: 'some-field-value',
                confidence: 0.5,
            },
            classificationId: 'field-suggestion-id',
            fieldName: 'some-field',
            responseId: 'field-suggestion-response-id',
        };
    };

    const fakeDocumentSuggestion = (): DocumentSuggestion => {
        return {
            responseId: 'document-suggestion-response-id',
            suggestionId: 'document-suggestion-id',
            suggestion: {
                documentPosition: 0,
                documentTitle: 'the document title',
                documentUri: 'some-document-uri',
                documentUriHash: 'documenturihash',
                documentUrl: 'some-document-url',
            },
        };
    };

    const expectMatchPayload = (actionName: CaseAssistActions, actionData: Object, ticket: TicketProperties) => {
        const body: string = lastCallBody(fetchMock);
        const content = JSON.parse(body);

        expectMatchActionPayload(content, actionName, actionData);
        expectMatchTicketPayload(content, ticket);
        expectMatchProperty(content, 'searchHub', defaultSearchHub);
    };

    const expectMatchActionPayload = (
        content: Record<string, unknown>,
        actionName: CaseAssistActions,
        actionData: Object
    ) => {
        expectMatchProperty(content, 'ec', 'svc');
        expectMatchProperty(content, 'svc_action', actionName);
        expectMatchProperty(content, 'svc_action_data', actionData);

        const expectedEvent =
            actionName === CaseAssistActions.enterInterface ? CaseAssistEvents.flowStart : CaseAssistEvents.click;
        expectMatchProperty(content, 'ea', expectedEvent);
    };

    const expectMatchTicketPayload = (content: Record<string, unknown>, ticket?: TicketProperties) => {
        expectMatchProperty(content, 'svc_ticket_id', ticket?.id);
        expectMatchProperty(content, 'svc_ticket_subject', ticket?.subject);
        expectMatchProperty(content, 'svc_ticket_description', ticket?.description);
        expectMatchProperty(content, 'svc_ticket_category', ticket?.category);
        expectMatchProperty(content, 'svc_ticket_product_id', ticket?.productId);
        expectMatchProperty(content, 'svc_ticket_custom', ticket?.custom);
    };

    const expectMatchProperty = (content: Record<string, unknown>, propName: string, propValue: unknown) => {
        if (typeof propValue !== 'undefined') {
            if (typeof propValue === 'object') {
                expect(content).toHaveProperty(propName);
                expect(content[propName]).toMatchObject(propValue as object);
            } else {
                expect(content).toHaveProperty(propName, propValue);
            }
        } else {
            expect(content).not.toHaveProperty(propName);
        }
    };

    it('should have #enableAnalytics default to #true', async () => {
        client = new CaseAssistClient({});

        await client.logEnterInterface({
            ticket: emptyTicket,
        });

        expect(fetchMock.called()).toBe(true);
    });

    it('should not send events when #enableAnalytics option is #false', async () => {
        client = new CaseAssistClient({
            enableAnalytics: false,
        });

        await client.logEnterInterface({
            ticket: emptyTicket,
        });

        expect(fetchMock.called()).toBe(false);
    });

    it('should not send events when doNotTrack is enabled', async () => {
        (doNotTrack as jest.Mock).mockImplementationOnce(() => true);

        client = new CaseAssistClient({});

        await client.logEnterInterface({
            ticket: emptyTicket,
        });

        expect(fetchMock.called()).toBe(false);
    });

    it('should not send events after #disable function is called', async () => {
        client.disable();

        await client.logEnterInterface({
            ticket: emptyTicket,
        });

        expect(fetchMock.called()).toBe(false);
    });

    it('disabling does not delete the visitorId', () => {
        const visitorId = 'uuid';
        Cookie.set('coveo_visitorId', visitorId);

        expect(Cookie.get('coveo_visitorId')).toBe(visitorId);
        client.disable();
        expect(Cookie.get('coveo_visitorId')).toBe(visitorId);
    });

    it('should send events after #enable function is called', async () => {
        client = new CaseAssistClient({
            enableAnalytics: false,
        });

        client.enable();

        await client.logEnterInterface({
            ticket: emptyTicket,
        });

        expect(fetchMock.called()).toBe(true);
    });

    it('should send proper payload for #logEnterInterface', async () => {
        await client.logEnterInterface({
            ticket: emptyTicket,
        });

        expectMatchPayload(CaseAssistActions.enterInterface, noActionData, noTicket);
    });

    it('should send proper payload for #logUpdateCaseField', async () => {
        await client.logUpdateCaseField({
            fieldName: 'subject',
            ticket: fakeTicket,
        });

        expectMatchPayload(CaseAssistActions.fieldUpdate, {fieldName: 'subject'}, fakeTicket);
    });

    it('should send proper payload for #logSelectFieldSuggestion', async () => {
        await client.logSelectFieldSuggestion({
            suggestion: fakeFieldSuggestion(),
            ticket: fakeTicket,
        });

        expectMatchPayload(CaseAssistActions.fieldSuggestionClick, fakeFieldSuggestion(), fakeTicket);
    });

    it('should send proper payload for #logSelectFieldSuggestion when the autoSelection property is set to true', async () => {
        const myFakeFieldSuggestion = fakeFieldSuggestion();
        myFakeFieldSuggestion.autoSelection = true;
        await client.logSelectFieldSuggestion({
            suggestion: myFakeFieldSuggestion,
            ticket: fakeTicket,
        });

        expectMatchPayload(CaseAssistActions.fieldSuggestionClick, myFakeFieldSuggestion, fakeTicket);
    });

    it('should send proper payload for #logSelectDocumentSuggestion', async () => {
        await client.logSelectDocumentSuggestion({
            suggestion: fakeDocumentSuggestion(),
            ticket: fakeTicket,
        });

        expectMatchPayload(CaseAssistActions.suggestionClick, fakeDocumentSuggestion(), fakeTicket);
    });

    it('should send proper payload for #logSelectDocumentSuggestion when the fromQuickview property is set to true', async () => {
        const myFakeDocumentSuggestion = fakeDocumentSuggestion();
        myFakeDocumentSuggestion.fromQuickview = true;
        await client.logSelectDocumentSuggestion({
            suggestion: myFakeDocumentSuggestion,
            ticket: fakeTicket,
        });

        expectMatchPayload(CaseAssistActions.suggestionClick, myFakeDocumentSuggestion, fakeTicket);
    });

    it('should send proper payload for #logSelectDocumentSuggestion when the openDocument property is set to true', async () => {
        const myFakeDocumentSuggestion = fakeDocumentSuggestion();
        myFakeDocumentSuggestion.openDocument = true;
        await client.logSelectDocumentSuggestion({
            suggestion: myFakeDocumentSuggestion,
            ticket: fakeTicket,
        });

        expectMatchPayload(CaseAssistActions.suggestionClick, myFakeDocumentSuggestion, fakeTicket);
    });

    it('should send proper payload for #logRateDocumentSuggestion', async () => {
        const rating = 0.8;

        await client.logRateDocumentSuggestion({
            rating,
            suggestion: fakeDocumentSuggestion(),
            ticket: fakeTicket,
        });

        expectMatchPayload(
            CaseAssistActions.suggestionRate,
            {
                ...fakeDocumentSuggestion(),
                rate: rating,
            },
            fakeTicket
        );
    });

    it('should send proper payload for #logMoveToNextCaseStep', async () => {
        const stageName = 'stage 1';

        await client.logMoveToNextCaseStep({
            ticket: fakeTicket,
            stage: stageName,
        });

        expectMatchPayload(CaseAssistActions.nextCaseStep, {stage: stageName}, fakeTicket);
    });

    it('should send proper payload for #logCaseCancelled', async () => {
        await client.logCaseCancelled({
            ticket: fakeTicket,
        });

        expectMatchPayload(
            CaseAssistActions.caseCancelled,
            {
                reason: CaseCancelledReasons.quit,
            },
            fakeTicket
        );
    });

    it('should send proper payload for #logCaseSolved', async () => {
        await client.logCaseSolved({
            ticket: fakeTicket,
        });

        expectMatchPayload(
            CaseAssistActions.caseSolved,
            {
                reason: CaseCancelledReasons.solved,
            },
            fakeTicket
        );
    });

    it('should send proper payload for #logCaseCreated', async () => {
        await client.logCaseCreated({
            ticket: fakeTicket,
        });

        expectMatchPayload(CaseAssistActions.caseCreated, noActionData, fakeTicket);
    });
});
