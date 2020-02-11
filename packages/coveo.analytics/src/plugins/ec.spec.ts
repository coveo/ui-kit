import { EC, ECPluginEventTypes } from './ec';
import { createAnalyticsClientMock } from '../../tests/analyticsClientMock';

describe('EC plugin', () => {
    let ec: EC;
    let client: ReturnType<typeof createAnalyticsClientMock>;

    const someUUIDGenerator = jest.fn(() => someUUID);
    const someUUID = '13ccebdb-0138-45e8-bf70-884817ead190';
    const defaultResult = {
        a: someUUID,
        de: document.characterSet,
        dl: 'http://localhost/',
        dr: 'http://somewhere.over/therainbow',
        dt: 'MAH PAGE',
        sd: '24-bit',
        sr: '0x0',
        tm: expect.any(String),
        ua: navigator.userAgent,
        ul: 'en-US',
        t: ECPluginEventTypes.event,
        z: someUUID,
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

    it('should append the product with the specific format when the hook is called', () => {
        ec.addProduct({ 'something': 'useful' });

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({ ...defaultResult, 'pr1something' : 'useful' });
    });

    it('should append the product with the pageview event', () => {
        ec.addProduct({ 'something': 'useful' });

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({ ...defaultResult, 'pr1something' : 'useful' });
    });

    it('should not append the product with a random event type', () => {
        ec.addProduct({ 'something': 'useful' });

        const result = executeRegisteredHook('🎲', {});

        expect(result).toEqual({});
    });

    it('should keep the products until a valid event type is used', () => {
        ec.addProduct({ 'something': 'useful' });

        executeRegisteredHook('🎲', {});
        executeRegisteredHook('🐟', {});
        executeRegisteredHook('💀', {});
        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({ ...defaultResult, 'pr1something' : 'useful' });
    });

    it('should convert known product keys into the measurement protocol format', () => {
        ec.addProduct({ 'name': '🧀', price: '5.99$' });

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({ ...defaultResult, 'pr1nm' : '🧀', 'pr1pr': '5.99$' });
    });

    it('should allow adding multiple products', () => {
        ec.addProduct({ 'name': '🍟', price: '1.99$' });
        ec.addProduct({ 'name': '🍿', price: '3$' });
        ec.addProduct({ 'name': '🥤', price: '2$' });

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({
            ...defaultResult,
            'pr1nm' : '🍟',
            'pr1pr': '1.99$',
            'pr2nm' : '🍿',
            'pr2pr': '3$',
            'pr3nm' : '🥤' ,
            'pr3pr': '2$',
        });
    });

    it('should flush the products once they are sent', () => {
        ec.addProduct({ 'name': '🍟', price: '1.99$' });
        ec.addProduct({ 'name': '🍿', price: '3$' });

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).not.toEqual({});

        const secondResult = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(secondResult).toEqual({...defaultResult});
    });

    it('should be able to set an action', () => {
        ec.setAction('ok');

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({
            ...defaultResult,
            'pa': 'ok'
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
        ec.addProduct({ 'name': '🍨', price: '2.99$' });
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
            'cid': payload.clientId,
            'de': payload.encoding,
            'pa': payload.action
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
            't': ECPluginEventTypes.pageview,
            'dp': payload.page,
            'dl': `${defaultResult.dl}${payload.page.substring(1)}`,
        });
        expect(event).toEqual({
            ...defaultResult,
            't': ECPluginEventTypes.event,
            'dl': `${defaultResult.dl}${payload.page.substring(1)}`,
        });
     });

    const executeRegisteredHook = (eventType: string, payload: any) => {
        const [hook] = client.registerBeforeSendEventHook.mock.calls[0];
        return hook(eventType, payload);
    };
});
