import {AnalyticsBeaconClient} from './analyticsBeaconClient';
import {EventType} from '../events';
import {AnalyticsClientOrigin, IAnalyticsRequestOptions, PreprocessAnalyticsRequest} from './analyticsRequestClient';

describe('AnalyticsBeaconClient', () => {
    const baseUrl = 'https://bloup.com';
    const token = '👛';
    const currentVisitorId = 'hereiam';

    const originalSendBeacon = navigator.sendBeacon;
    const sendBeaconMock = jest.fn();
    beforeAll(() => {
        navigator.sendBeacon = sendBeaconMock;
    });

    afterAll(() => {
        navigator.sendBeacon = originalSendBeacon;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('can send an event', async () => {
        const eventType: EventType = EventType.custom;

        const client = new AnalyticsBeaconClient({
            baseUrl,
            token,
            visitorIdProvider: {
                getCurrentVisitorId: () => Promise.resolve(currentVisitorId),
                setCurrentVisitorId: (visitorId) => {},
            },
        });

        await client.sendEvent(eventType, {
            wow: 'ok',
        });

        expect(sendBeaconMock).toHaveBeenCalledWith(
            `${baseUrl}/analytics/custom?access_token=👛&visitorId=${currentVisitorId}&discardVisitInfo=true`,
            expect.anything()
        );
        expect(await getSendBeaconFirstCallBlobArgument()).toBe(`customEvent=${encodeURIComponent('{"wow":"ok"}')}`);
    });

    it('can send a collect event with the proper payload', async () => {
        const eventType: EventType = EventType.collect;

        const client = new AnalyticsBeaconClient({
            baseUrl,
            token,
            visitorIdProvider: {
                getCurrentVisitorId: () => Promise.resolve(currentVisitorId),
                setCurrentVisitorId: (visitorId) => {},
            },
        });

        await client.sendEvent(eventType, {
            pr1a: 'value',
            'to encode': 'to encode',
        });

        expect(sendBeaconMock).toHaveBeenCalledWith(
            `${baseUrl}/analytics/collect?visitorId=${currentVisitorId}&discardVisitInfo=true`,
            expect.anything()
        );
        expect(await getSendBeaconFirstCallBlobArgument()).toBe(
            `access_token=${encodeURIComponent('👛')}&collectEvent=${encodeURIComponent(
                '{"pr1a":"value","to encode":"to encode"}'
            )}`
        );
    });

    it('can send a collect event with a more complex payload', async () => {
        const eventType: EventType = EventType.collect;

        const client = new AnalyticsBeaconClient({
            baseUrl,
            token,
            visitorIdProvider: {
                getCurrentVisitorId: () => {
                    return Promise.resolve(currentVisitorId);
                },
                setCurrentVisitorId: (visitorId) => {},
            },
        });

        await client.sendEvent(eventType, {
            value: {
                subvalue: 'ok',
            },
        });

        expect(sendBeaconMock).toHaveBeenCalledWith(
            `${baseUrl}/analytics/collect?visitorId=${currentVisitorId}&discardVisitInfo=true`,
            expect.anything()
        );
        expect(await getSendBeaconFirstCallBlobArgument()).toBe(
            `access_token=${encodeURIComponent('👛')}&collectEvent=${encodeURIComponent('{"value":{"subvalue":"ok"}}')}`
        );
    });

    describe('allows to preprocessRequest', () => {
        const setupClient = (preprocessRequest: PreprocessAnalyticsRequest) => {
            return new AnalyticsBeaconClient({
                baseUrl,
                token,
                visitorIdProvider: {
                    getCurrentVisitorId: () => {
                        return Promise.resolve(currentVisitorId);
                    },
                    setCurrentVisitorId: () => {},
                },
                preprocessRequest,
            });
        };

        it('to modify the origin and the body of the request', async () => {
            let clientOrigin: AnalyticsClientOrigin;
            const processedRequest: IAnalyticsRequestOptions = {
                url: 'https://www.myownanalytics.com/endpoint',
                body: JSON.stringify({
                    test: 'custom',
                }),
            };
            const client = setupClient((_request, type) => {
                clientOrigin = type;
                return processedRequest;
            });

            await client.sendEvent(EventType.collect, {});

            expect(clientOrigin!).toBe('analyticsBeacon');
            expect(sendBeaconMock).toHaveBeenCalledWith(processedRequest.url, expect.anything());
            expect(await getSendBeaconFirstCallBlobArgument()).toContain('%22test%22%3A%22custom%22');
        });

        it('to modify the request body as a JSON string for a collect event', async () => {
            const client = setupClient((request) => {
                const bodyShouldBeAvailableAsJSONString = JSON.parse(request.body as string);
                expect(bodyShouldBeAvailableAsJSONString).toEqual({foo: 'bar'});
                bodyShouldBeAvailableAsJSONString.foo = 'baz';
                request.body = JSON.stringify(bodyShouldBeAvailableAsJSONString);
                return request;
            });

            await client.sendEvent(EventType.collect, {foo: 'bar'});
            expect(await getSendBeaconFirstCallBlobArgument()).toBe(
                'access_token=%F0%9F%91%9B&collectEvent=%7B%22foo%22%3A%22baz%22%7D'
            );
        });

        it('to modify the request body as a JSON string for a click event', async () => {
            const client = setupClient((request) => {
                const bodyParsedAsJSON = JSON.parse(request.body as string);
                expect(bodyParsedAsJSON).toEqual({actionCause: 'foo'});
                bodyParsedAsJSON.actionCause = 'bar';
                request.body = JSON.stringify(bodyParsedAsJSON);
                return request;
            });

            await client.sendEvent(EventType.click, {actionCause: 'foo'});
            expect(await getSendBeaconFirstCallBlobArgument()).toContain(
                `clickEvent=${encodeURIComponent('{"actionCause":"bar"}')}`
            );
        });

        it('to augment the request body as a JSON string for a click event', async () => {
            const client = setupClient((request) => {
                const bodyParsedAsJSON = JSON.parse(request.body as string);
                bodyParsedAsJSON.aNewProperty = 'bar';
                request.body = JSON.stringify(bodyParsedAsJSON);
                return request;
            });

            await client.sendEvent(EventType.click, {actionCause: 'foo'});
            expect(await getSendBeaconFirstCallBlobArgument()).toContain(
                `clickEvent=${encodeURIComponent('{"actionCause":"foo","aNewProperty":"bar"}')}`
            );
        });

        it('should keep original request body if preprocessRequest returns an invalid JSON string', async () => {
            const client = setupClient((request) => {
                request.body = 'invalid JSON string';
                return request;
            });

            await client.sendEvent(EventType.click, {actionCause: 'bar'});
            expect(await getSendBeaconFirstCallBlobArgument()).toContain(
                `clickEvent=${encodeURIComponent(`{"actionCause":"bar"}`)}`
            );
        });
    });

    const getSendBeaconFirstCallBlobArgument = async () => {
        const blobArgument: Blob = sendBeaconMock.mock.calls[0][1];
        expect(blobArgument.size).toBeGreaterThan(0);
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                resolve(reader.result);
            });
            reader.readAsText(blobArgument);
        });
    };
});
