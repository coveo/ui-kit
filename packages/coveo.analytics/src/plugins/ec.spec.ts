import { EC, ECPluginEventTypes } from './ec';
import { createAnalyticsClientMock } from '../../tests/analyticsClientMock';

describe('EC plugin', () => {
    let ec: EC;
    let client: ReturnType<typeof createAnalyticsClientMock>;

    const someUUIDGenerator = jest.fn(() => someUUID);
    const someUUID = '13ccebdb-0138-45e8-bf70-884817ead190';
    const defaultResult = {
        pageViewId: someUUID,
        encoding: document.characterSet,
        location: 'http://localhost/',
        referrer: 'http://somewhere.over/therainbow',
        title: 'MAH PAGE',
        screenColor: '24-bit',
        screenResolution: '0x0',
        time: expect.any(String),
        userAgent: navigator.userAgent,
        language: 'en-US',
        hitType: ECPluginEventTypes.event,
        eventId: someUUID,
        anonymizeIp: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        client = createAnalyticsClientMock();
        ec = new EC({ client, uuidGenerator: someUUIDGenerator });
    });

    it('should register a hook in the client', () => {
        expect(client.registerBeforeSendEventHook).toHaveBeenCalledTimes(1);
    });

    it('should register a mapping for each EC type', () => {
        expect(client.addEventTypeMapping).toHaveBeenCalledTimes(Object.keys(ECPluginEventTypes).length);
    });

    describe('products', () => {
        it('should append the product with the specific format when the hook is called', () => {
            ec.addProduct({ id: 'C0V30' });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({ ...defaultResult, 'pr1id' : 'C0V30' });
        });

        it('should append the product with the pageview event', () => {
            ec.addProduct({ name: 'Relevance T-Shirt' });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({ ...defaultResult, 'pr1nm' : 'Relevance T-Shirt' });
        });

        it('should not append the product with a random event type', () => {
            ec.addProduct({ id: ':sorandom:' });

            const result = executeRegisteredHook('🎲', {});

            expect(result).toEqual({});
        });

        it('should keep the products until a valid event type is used', () => {
            ec.addProduct({ id: 'P12345'});

            executeRegisteredHook('🎲', {});
            executeRegisteredHook('🐟', {});
            executeRegisteredHook('💀', {});
            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({ ...defaultResult, 'pr1id' : 'P12345' });
        });

        it('should convert known product keys into the measurement protocol format', () => {
            ec.addProduct({ 'name': '🧀', price: 5.99 });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({ ...defaultResult, 'pr1nm' : '🧀', 'pr1pr': 5.99 });
        });

        it('should allow adding multiple products', () => {
            ec.addProduct({ 'name': '🍟', price: 1.99 });
            ec.addProduct({ 'name': '🍿', price: 3 });
            ec.addProduct({ 'name': '🥤', price: 2 });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                'pr1nm' : '🍟',
                'pr1pr': 1.99,
                'pr2nm' : '🍿',
                'pr2pr': 3,
                'pr3nm' : '🥤',
                'pr3pr': 2,
            });
        });

        it('should flush the products once they are sent', () => {
            ec.addProduct({ 'name': '🍟', price: 1.99 });
            ec.addProduct({ 'name': '🍿', price: 3 });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).not.toEqual({});

            const secondResult = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(secondResult).toEqual({...defaultResult});
        });
    });

    describe('impressions', () => {
        it('should append the impression with the specific format when the hook is called', () => {
            ec.addImpression({ id: 'C0V30' });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({ ...defaultResult, 'il1pi1id' : 'C0V30' });
        });

        it('should append the impression with the pageview event', () => {
            ec.addImpression({ name: 'Relevance T-Shirt' });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({ ...defaultResult, 'il1pi1nm' : 'Relevance T-Shirt' });
        });

        it('should not append the impression with a random event type', () => {
            ec.addImpression({ id: ':sorandom:' });

            const result = executeRegisteredHook('🎲', {});

            expect(result).toEqual({});
        });

        it('should keep the impressions until a valid event type is used', () => {
            ec.addImpression({ id: 'P12345'});

            executeRegisteredHook('🎲', {});
            executeRegisteredHook('🐟', {});
            executeRegisteredHook('💀', {});
            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({ ...defaultResult, 'il1pi1id' : 'P12345' });
        });

        it('should convert known impression keys into the measurement protocol format', () => {
            ec.addImpression({ 'name': '🧀', price: 5.99 });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({ ...defaultResult, 'il1pi1nm' : '🧀', 'il1pi1pr': 5.99 });
        });

        it('should allow adding multiple impressions', () => {
            ec.addImpression({ name: '🍟', price: 1.99 });
            ec.addImpression({ name: '🍿', price: 3 });
            ec.addImpression({ name: '🥤', price: 2 });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                'il1pi1nm' : '🍟',
                'il1pi1pr': 1.99,
                'il1pi2nm' : '🍿',
                'il1pi2pr': 3,
                'il1pi3nm' : '🥤',
                'il1pi3pr': 2,
            });
        });

        it('should allow adding impressions from multiple lists', () => {
            ec.addImpression({ list: 'food', name: '🍟', price: 1.99 });
            ec.addImpression({ list: 'food', name: '🍿', price: 3 });
            ec.addImpression({ list: 'drinks', name: '🥤', price: 2 });
            ec.addImpression({ list: 'drinks', name: '🧃', price: 0.99});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                'il1nm': 'food',
                'il1pi1nm' : '🍟',
                'il1pi1pr': 1.99,
                'il1pi2nm' : '🍿',
                'il1pi2pr': 3,
                'il2nm': 'drinks',
                'il2pi1nm' : '🥤',
                'il2pi1pr': 2,
                'il2pi2nm' : '🧃',
                'il2pi2pr': 0.99,
            });
        });

        it('should flush the products once they are sent', () => {
            ec.addImpression({ 'name': '🍟', price: 1.99 });
            ec.addImpression({ 'name': '🍿', price: 3 });

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).not.toEqual({});

            const secondResult = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(secondResult).toEqual({...defaultResult});
        });
    });

    it('should be able to set an action', () => {
        ec.setAction('ok');

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({
            ...defaultResult,
            action: 'ok'
        });
    });

    it('should flush the action once it is sent', () => {
        ec.setAction('ok');

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).not.toEqual({});

        const secondResult = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(secondResult).toEqual({...defaultResult});
    });

    it('should be able to clear all the data', () => {
        ec.addProduct({ name: '🍨', price: 2.99 });
        ec.addImpression({ id: '🍦', price: 3.49 });
        ec.clearData();

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({...defaultResult});
    });

    it('should convert known EC keys to the measurement protocol format in the hook', () => {
        const payload = {
            clientId: '1234',
            encoding: 'en-GB',
            action: 'bloup'
        };

        const result = executeRegisteredHook(ECPluginEventTypes.event, payload);

        expect(result).toEqual({
            ...defaultResult,
            clientId: payload.clientId,
            encoding: payload.encoding,
            action: payload.action
        });
    });

    it('should call the uuidv4 method', async () => {
       await executeRegisteredHook(ECPluginEventTypes.event, {});
       await executeRegisteredHook(ECPluginEventTypes.event, {});
       await executeRegisteredHook(ECPluginEventTypes.event, {});

       // One for generating pageViewId, one for each individual event.
        expect(someUUIDGenerator).toHaveBeenCalledTimes(1 + 3);
    });

    it('should update the location when sending a pageview with the page parameter', async () => {
        const payload = {
            page: '/somepage'
        };

        const pageview = await executeRegisteredHook(ECPluginEventTypes.pageview, payload);
        const event = await executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(pageview).toEqual({
            ...defaultResult,
            hitType: ECPluginEventTypes.pageview,
            page: payload.page,
            location: `${defaultResult.location}${payload.page.substring(1)}`,
        });
        expect(event).toEqual({
            ...defaultResult,
            hitType: ECPluginEventTypes.event,
            location: `${defaultResult.location}${payload.page.substring(1)}`,
        });
     });

    const executeRegisteredHook = (eventType: string, payload: any) => {
        const [hook] = client.registerBeforeSendEventHook.mock.calls[0];
        return hook(eventType, payload);
    };
});
