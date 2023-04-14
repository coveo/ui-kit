import {ECPlugin, ECPluginEventTypes, Product} from './ec';
import {createAnalyticsClientMock} from '../../tests/analyticsClientMock';

describe('EC plugin', () => {
    let ec: ECPlugin;
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
        hitType: ECPluginEventTypes.event,
        eventId: someUUID,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        client = createAnalyticsClientMock();
        ec = new ECPlugin({client, uuidGenerator: someUUIDGenerator as any});
    });

    it('should register a hook in the client', () => {
        expect(client.registerBeforeSendEventHook).toHaveBeenCalledTimes(1);
    });

    it('should register a mapping for each EC type', () => {
        expect(client.addEventTypeMapping).toHaveBeenCalledTimes(Object.keys(ECPluginEventTypes).length);
    });

    describe('products', () => {
        it('should append the product with the specific format when the hook is called', () => {
            ec.addProduct({id: 'C0V30'});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({...defaultResult, pr1id: 'C0V30'});
        });

        it('should append the product with the pageview event', () => {
            ec.addProduct({name: 'Relevance T-Shirt'});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({...defaultResult, pr1nm: 'Relevance T-Shirt'});
        });

        it('should not append the product with a random event type', () => {
            ec.addProduct({id: ':sorandom:'});

            const result = executeRegisteredHook('🎲', {});

            expect(result).toEqual({});
        });

        it('should keep the products until a valid event type is used', () => {
            ec.addProduct({id: 'P12345'});

            executeRegisteredHook('🎲', {});
            executeRegisteredHook('🐟', {});
            executeRegisteredHook('💀', {});
            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({...defaultResult, pr1id: 'P12345'});
        });

        it('should convert known product keys into the measurement protocol format', () => {
            ec.addProduct({name: '🧀', price: 5.99});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({...defaultResult, pr1nm: '🧀', pr1pr: 5.99});
        });

        it('should keep custom metadata in the product', () => {
            ec.addProduct({name: '🧀', price: 5.99, custom: {verycustom: 'value'}});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({...defaultResult, pr1nm: '🧀', pr1pr: 5.99, pr1custom: {verycustom: 'value'}});
        });

        it('should allow adding multiple products', () => {
            ec.addProduct({name: '🍟', price: 1.99});
            ec.addProduct({name: '🍿', price: 3});
            ec.addProduct({name: '🥤', price: 2});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                pr1nm: '🍟',
                pr1pr: 1.99,
                pr2nm: '🍿',
                pr2pr: 3,
                pr3nm: '🥤',
                pr3pr: 2,
            });
        });

        it('should flush the products once they are sent', () => {
            ec.addProduct({name: '🍟', price: 1.99});
            ec.addProduct({name: '🍿', price: 3});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).not.toEqual({});

            const secondResult = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(secondResult).toEqual({...defaultResult});
        });

        it('should convert position to number if possible', () => {
            testValidNumberConversion('position', 'pr1ps');
        });

        it('should keep original value if position is not a number', () => {
            testInvalidNumberConversion('position', 'pr1ps');
        });

        it('should convert quantity to number if possible', () => {
            testValidNumberConversion('quantity', 'pr1qt');
        });

        it('should keep original value if quantity is not a number', () => {
            testInvalidNumberConversion('quantity', 'pr1qt');
        });

        describe('when the position is invalid', () => {
            it('should warn when executing hook on added product', () => {
                jest.spyOn(console, 'warn').mockImplementation();

                const aProductWithATooSmallPosition = {
                    name: 'A product with a too small position',
                    position: 0,
                };

                ec.addProduct(aProductWithATooSmallPosition);

                expect(console.warn).not.toHaveBeenCalled();

                executeRegisteredHook(ECPluginEventTypes.event, {});

                expect(console.warn).toHaveBeenCalledWith(
                    `The position for product '${aProductWithATooSmallPosition.name}' must be greater than 0 when provided.`
                );
                expect(console.warn).toHaveBeenCalledTimes(1);
            });

            it('should remove the position when executing hook on added product', () => {
                jest.spyOn(console, 'warn').mockImplementation();

                ec.addProduct({
                    name: 'A product with a too small position',
                    position: 0,
                });

                const result = executeRegisteredHook(ECPluginEventTypes.event, {});

                const positionProperty = 'il1pi1ps';
                expect(result).not.toHaveProperty(positionProperty);
            });

            it('should warn first using the product name then the id', () => {
                jest.spyOn(console, 'warn').mockImplementation();

                const aProductWithANameAndId = {
                    name: 'A product with a name and id',
                    id: 'A product id',
                    position: 0,
                };
                const aProductWithOnlyAnId = {
                    id: 'A product id',
                    position: 0,
                };

                ec.addProduct(aProductWithANameAndId);
                ec.addProduct(aProductWithOnlyAnId);

                executeRegisteredHook(ECPluginEventTypes.event, {});

                expect(console.warn).toHaveBeenNthCalledWith(
                    1,
                    `The position for product '${aProductWithANameAndId.name}' must be greater than 0 when provided.`
                );
                expect(console.warn).toHaveBeenNthCalledWith(
                    2,
                    `The position for product '${aProductWithOnlyAnId.id}' must be greater than 0 when provided.`
                );
            });

            it('should tolerate an absent position', () => {
                jest.spyOn(console, 'warn').mockImplementation();

                ec.addProduct({
                    name: 'A product with no position',
                });

                const undefinedPosition = undefined as any;
                ec.addProduct({
                    name: 'A product with an undefined position',
                    position: undefinedPosition,
                });

                const result = executeRegisteredHook(ECPluginEventTypes.event, {});

                expect(console.warn).not.toHaveBeenCalled();

                const firstPositionProperty = 'il1pi1ps';
                expect(result).not.toHaveProperty(firstPositionProperty);

                const secondPositionProperty = 'il1pi2ps';
                expect(result).toHaveProperty(secondPositionProperty, undefinedPosition);
            });
        });
    });

    describe('impressions', () => {
        it('should append the impression with the specific format when the hook is called', () => {
            ec.addImpression({id: 'C0V30'});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({...defaultResult, il1pi1id: 'C0V30'});
        });

        it('should append the impression with the pageview event', () => {
            ec.addImpression({name: 'Relevance T-Shirt'});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                il1pi1nm: 'Relevance T-Shirt',
            });
        });

        it('should not append the impression with a random event type', () => {
            ec.addImpression({id: ':sorandom:'});

            const result = executeRegisteredHook('🎲', {});

            expect(result).toEqual({});
        });

        it('should keep the impressions until a valid event type is used', () => {
            ec.addImpression({id: 'P12345'});

            executeRegisteredHook('🎲', {});
            executeRegisteredHook('🐟', {});
            executeRegisteredHook('💀', {});
            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({...defaultResult, il1pi1id: 'P12345'});
        });

        it('should convert known impression keys into the measurement protocol format', () => {
            ec.addImpression({name: '🧀', price: 5.99});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                il1pi1nm: '🧀',
                il1pi1pr: 5.99,
            });
        });

        it('should convert known impression keys that are extended for Coveo into the measurement protocol format', () => {
            ec.addImpression({name: '🧀', group: 'mahgroup'});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                il1pi1nm: '🧀',
                il1pi1group: 'mahgroup',
            });
        });

        it('should keep custom metadata in the impression', () => {
            ec.addImpression({name: '🧀', price: 5.99, custom: {verycustom: 'value'}});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                il1pi1nm: '🧀',
                il1pi1pr: 5.99,
                il1pi1custom: {verycustom: 'value'},
            });
        });

        it('should allow adding multiple impressions', () => {
            ec.addImpression({name: '🍟', price: 1.99});
            ec.addImpression({name: '🍿', price: 3});
            ec.addImpression({name: '🥤', price: 2});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                il1pi1nm: '🍟',
                il1pi1pr: 1.99,
                il1pi2nm: '🍿',
                il1pi2pr: 3,
                il1pi3nm: '🥤',
                il1pi3pr: 2,
            });
        });

        it('should allow adding impressions from multiple lists', () => {
            ec.addImpression({list: 'food', name: '🍟', price: 1.99});
            ec.addImpression({list: 'food', name: '🍿', price: 3});
            ec.addImpression({list: 'drinks', name: '🥤', price: 2});
            ec.addImpression({list: 'drinks', name: '🧃', price: 0.99});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).toEqual({
                ...defaultResult,
                il1nm: 'food',
                il1pi1nm: '🍟',
                il1pi1pr: 1.99,
                il1pi2nm: '🍿',
                il1pi2pr: 3,
                il2nm: 'drinks',
                il2pi1nm: '🥤',
                il2pi1pr: 2,
                il2pi2nm: '🧃',
                il2pi2pr: 0.99,
            });
        });

        it('should flush the products once they are sent', () => {
            ec.addImpression({name: '🍟', price: 1.99});
            ec.addImpression({name: '🍿', price: 3});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(result).not.toEqual({});

            const secondResult = executeRegisteredHook(ECPluginEventTypes.event, {});

            expect(secondResult).toEqual({...defaultResult});
        });

        describe('when the position is invalid', () => {
            it('should warn when executing hook on added impression', () => {
                jest.spyOn(console, 'warn').mockImplementation();

                const anImpression = {
                    name: 'An impression with a too small position',
                    position: 0,
                };

                ec.addImpression(anImpression);

                expect(console.warn).not.toHaveBeenCalled();

                executeRegisteredHook(ECPluginEventTypes.event, {});

                expect(console.warn).toHaveBeenCalledWith(
                    `The position for impression '${anImpression.name}' must be greater than 0 when provided.`
                );
                expect(console.warn).toHaveBeenCalledTimes(1);
            });

            it('should remove the position when executing hook on added impression', () => {
                jest.spyOn(console, 'warn').mockImplementation();

                ec.addImpression({
                    name: 'An impression with a too small position',
                    position: 0,
                });

                const result = executeRegisteredHook(ECPluginEventTypes.event, {});

                const positionProperty = 'il1pi1ps';
                expect(result).not.toHaveProperty(positionProperty);
            });

            it('should warn first using the impression name then the id', () => {
                jest.spyOn(console, 'warn').mockImplementation();

                const anImpressionWithANameAndId = {
                    name: 'An impression with a name and id',
                    id: 'An id',
                    position: 0,
                };
                const anImpressionWithOnlyAnId = {
                    id: 'An id',
                    position: 0,
                };

                ec.addImpression(anImpressionWithANameAndId);
                ec.addImpression(anImpressionWithOnlyAnId);

                executeRegisteredHook(ECPluginEventTypes.event, {});

                expect(console.warn).toHaveBeenNthCalledWith(
                    1,
                    `The position for impression '${anImpressionWithANameAndId.name}' must be greater than 0 when provided.`
                );
                expect(console.warn).toHaveBeenNthCalledWith(
                    2,
                    `The position for impression '${anImpressionWithOnlyAnId.id}' must be greater than 0 when provided.`
                );
            });

            it('should tolerate an absent position', () => {
                jest.spyOn(console, 'warn').mockImplementation();

                ec.addImpression({
                    name: 'An impression with no position',
                });

                const undefinedPosition = undefined as any;
                ec.addImpression({
                    name: 'An impression with an undefined position',
                    position: undefinedPosition,
                });

                const result = executeRegisteredHook(ECPluginEventTypes.event, {});

                expect(console.warn).not.toHaveBeenCalled();

                const firstPositionProperty = 'il1pi1ps';
                expect(result).not.toHaveProperty(firstPositionProperty);

                const secondPositionProperty = 'il1pi2ps';
                expect(result).toHaveProperty(secondPositionProperty, undefinedPosition);
            });
        });
    });

    it('should be able to set an action', () => {
        ec.setAction('ok');

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({
            ...defaultResult,
            action: 'ok',
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
        ec.addProduct({name: '🍨', price: 2.99});
        ec.addImpression({id: '🍦', price: 3.49});
        ec.clearData();

        const result = executeRegisteredHook(ECPluginEventTypes.event, {});

        expect(result).toEqual({...defaultResult});
    });

    it('should convert known EC keys to the measurement protocol format in the hook', () => {
        const payload = {
            clientId: '1234',
            encoding: 'en-GB',
            action: 'bloup',
        };

        const result = executeRegisteredHook(ECPluginEventTypes.event, payload);

        expect(result).toEqual({
            ...defaultResult,
            clientId: payload.clientId,
            encoding: payload.encoding,
            action: payload.action,
        });
    });

    it('should call the uuidv4 method', async () => {
        await executeRegisteredHook(ECPluginEventTypes.event, {});
        await executeRegisteredHook(ECPluginEventTypes.event, {});
        await executeRegisteredHook(ECPluginEventTypes.event, {});

        // One for generating pageViewId, one for each individual event.
        expect(someUUIDGenerator).toHaveBeenCalledTimes(1 + 3);
    });

    it('should update the location when sending a pageview with the page parameter', () => {
        const payload = {
            page: '/somepage',
        };

        const pageview = executeRegisteredHook(ECPluginEventTypes.pageview, payload);
        const event = executeRegisteredHook(ECPluginEventTypes.event, {});

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
        const [beforeHook] = client.registerBeforeSendEventHook.mock.calls[0];
        const [afterHook] = client.registerAfterSendEventHook.mock.calls[0];
        const result = beforeHook(eventType, payload);
        afterHook(eventType, result);
        return result;
    };

    const testValidNumberConversion = (source: keyof Product, target: string) => {
        const validValues = ['13', '0', '.0', '-10', '5.0', '-1.1'];
        for (const value of validValues) {
            // @ts-ignore
            ec.addProduct({name: 'product', [source]: value});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});
            const expected: Record<string, any> = {...defaultResult, pr1nm: 'product', [target]: +value};
            if (source === 'position' && expected[target] < 1) {
                delete expected[target];
            }

            expect(result).toEqual(expected);
        }
    };

    const testInvalidNumberConversion = (source: keyof Product, target: string) => {
        const invalidValues = ['1-2-3', '', '.', '-', '5.', '123abc'];
        for (const value of invalidValues) {
            // @ts-ignore
            ec.addProduct({name: 'product', [source]: value});

            const result = executeRegisteredHook(ECPluginEventTypes.event, {});
            const expected: Record<string, unknown> = {...defaultResult, pr1nm: 'product', [target]: value};
            if (source === 'position' && !expected[target]) {
                delete expected[target];
            }

            expect(result).toEqual(expected);
        }
    };
});
