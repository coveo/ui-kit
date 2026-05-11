import {SVCPlugin, SVCPluginEventTypes} from './svc';
import {createAnalyticsClientMock} from '../../tests/analyticsClientMock';

describe('SVC plugin', () => {
    let svc: SVCPlugin;
    let client: ReturnType<typeof createAnalyticsClientMock>;

    const someUUIDGenerator = jest.fn(() => someUUID);
    const someUUID = '13ccebdb-0138-45e8-bf70-884817ead190';
    const defaultResult = {
        pageViewId: someUUID,
        encoding: document.characterSet,
        location: 'http://localhost/',
        referrer: 'http://somewhere.over/thereferrer',
        title: 'MAH PAGE',
        screenColor: '24-bit',
        screenResolution: '0x0',
        time: expect.any(Number),
        userAgent: navigator.userAgent,
        language: 'en-US',
        hitType: SVCPluginEventTypes.event,
        eventId: someUUID,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        client = createAnalyticsClientMock();
        svc = new SVCPlugin({client, uuidGenerator: someUUIDGenerator as any});
    });

    it('should register a hook in the client', () => {
        expect(client.registerBeforeSendEventHook).toHaveBeenCalledTimes(1);
    });

    it('should register a mapping for each SVC type', () => {
        expect(client.addEventTypeMapping).toHaveBeenCalledTimes(Object.keys(SVCPluginEventTypes).length);
    });

    describe('tickets', () => {
        it('should set the ticket with the specific format and convert known ticket keys into the measurement protocol format when the hook is called', () => {
            svc.setTicket({
                id: 'Some ID',
                subject: 'Some Subject',
                description: 'Some Description',
                category: 'Some Category',
                productId: 'Some Product ID',
                custom: {someCustomProp: 'some custom prop value'},
            });

            const result = executeRegisteredHook(SVCPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                svc_ticket_id: 'Some ID',
                svc_ticket_subject: 'Some Subject',
                svc_ticket_description: 'Some Description',
                svc_ticket_category: 'Some Category',
                svc_ticket_product_id: 'Some Product ID',
                svc_ticket_custom: {someCustomProp: 'some custom prop value'},
            });
        });

        it('should append the ticket with the pageview event', () => {
            svc.setTicket({subject: 'Some Subject'});

            const result = executeRegisteredHook(SVCPluginEventTypes.pageview, {});

            expect(result).toEqual({
                ...defaultResult,
                hitType: SVCPluginEventTypes.pageview,
                svc_ticket_subject: 'Some Subject',
            });
        });

        it('should not append the product with a random event type', () => {
            svc.setTicket({subject: 'Some Subject'});

            const result = executeRegisteredHook('🎲', {});

            expect(result).toEqual({});
        });

        it('should keep the ticket until a valid event type is used', () => {
            svc.setTicket({subject: 'Some Subject'});

            executeRegisteredHook('🎲', {});
            executeRegisteredHook('🐟', {});
            executeRegisteredHook('💀', {});
            const result = executeRegisteredHook(SVCPluginEventTypes.event, {});

            expect(result).toEqual({...defaultResult, svc_ticket_subject: 'Some Subject'});
        });

        it('should keep custom metadata in the ticket', () => {
            svc.setTicket({subject: '🧀', custom: {verycustom: 'value'}});

            const result = executeRegisteredHook(SVCPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                svc_ticket_subject: '🧀',
                svc_ticket_custom: {verycustom: 'value'},
            });
        });

        it('should flush the ticket once they are sent', () => {
            svc.setTicket({subject: '🍟', description: 'description'});

            const firstResult = executeRegisteredHook(SVCPluginEventTypes.event, {});
            const secondResult = executeRegisteredHook(SVCPluginEventTypes.event, {});

            expect(firstResult).not.toEqual({});
            expect(secondResult).toEqual({...defaultResult});
        });
    });

    it('should be able to set an action', () => {
        svc.setAction('ok');

        const result = executeRegisteredHook(SVCPluginEventTypes.event, {});

        expect(result).toEqual({
            ...defaultResult,
            svcAction: 'ok',
        });
    });

    it('should flush the action once it is sent', () => {
        svc.setAction('ok');

        const firstResult = executeRegisteredHook(SVCPluginEventTypes.event, {});
        const secondResult = executeRegisteredHook(SVCPluginEventTypes.event, {});

        expect(firstResult).not.toEqual({});
        expect(secondResult).toEqual({...defaultResult});
    });

    it('should be able to clear all the data', () => {
        svc.setTicket({subject: '🍨', description: 'Some desc'});
        svc.clearData();

        const result = executeRegisteredHook(SVCPluginEventTypes.event, {});

        expect(result).toEqual({...defaultResult});
    });

    it('should call the uuidv4 method', async () => {
        await executeRegisteredHook(SVCPluginEventTypes.event, {});
        await executeRegisteredHook(SVCPluginEventTypes.event, {});
        await executeRegisteredHook(SVCPluginEventTypes.event, {});

        // One for generating pageViewId, one for each individual event.
        expect(someUUIDGenerator).toHaveBeenCalledTimes(1 + 3);
    });

    it('should update the location when sending a pageview with the page parameter', async () => {
        const payload = {
            page: '/somepage',
        };

        const pageview = await executeRegisteredHook(SVCPluginEventTypes.pageview, payload);
        const event = await executeRegisteredHook(SVCPluginEventTypes.event, {});

        expect(pageview).toEqual({
            ...defaultResult,
            hitType: SVCPluginEventTypes.pageview,
            page: payload.page,
            location: `${defaultResult.location}${payload.page.substring(1)}`,
        });
        expect(event).toEqual({
            ...defaultResult,
            hitType: SVCPluginEventTypes.event,
            location: `${defaultResult.location}${payload.page.substring(1)}`,
        });
    });

    const executeRegisteredHook = (eventType: string, payload: any) => {
        const [beforeHook] = client.registerBeforeSendEventHook.mock.calls[0];
        const [afterHook] = client.registerAfterSendEventHook.mock.calls[0];
        const result = beforeHook(eventType, payload);
        afterHook(eventType, result);
        return result;
    };
});
