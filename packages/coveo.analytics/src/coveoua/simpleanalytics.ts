import {AnyEventResponse, EventType, SendEventArguments, VariableArgumentsPayload} from '../events';
import {AnalyticsClient, CoveoAnalyticsClient, Endpoints} from '../client/analytics';
import {Plugins} from './plugins';
import {PluginOptions} from '../plugins/BasePlugin';
import {PluginClass} from '../plugins/BasePlugin';
import {libVersion} from '../version';

export type AvailableActions = keyof CoveoUA;

export interface CoveoUAOptions {
    endpoint?: string;
    isCustomEndpoint?: boolean;
    plugins?: string[];
}

// CoveoUA mimics the GoogleAnalytics API.
export class CoveoUA {
    public client?: AnalyticsClient;
    private plugins: Plugins = new Plugins();
    private params: {[name: string]: string} = {};

    // init initializes a new SimpleAPI client.
    // @param token is your coveo access_token / api_key / ...
    // @param endpoint is the endpoint you want to target defaults to the
    //        usage analytics production endpoint
    init(token: string | AnalyticsClient, optionsOrEndpoint: string | CoveoUAOptions): void {
        if (!token) {
            throw new Error(`You must pass your token when you call 'init'`);
        }

        if (typeof token === 'string') {
            this.client = new CoveoAnalyticsClient({
                token: token,
                endpoint: this.getEndpoint(optionsOrEndpoint),
                isCustomEndpoint: this.getIsCustomEndpoint(optionsOrEndpoint),
            });
        } else if (this.isAnalyticsClient(token)) {
            this.client = token;
        }

        if (this.client) {
            const pluginOptions: PluginOptions = {client: this.client};
            this.plugins.clearRequired();
            this.getPluginKeys(optionsOrEndpoint).forEach((pluginKey) =>
                this.plugins.require(pluginKey, pluginOptions)
            );
            this.client.registerBeforeSendEventHook((eventType, payload) => ({
                ...payload,
                ...this.params,
            }));
        } else {
            throw new Error(`You must pass either your token or a valid object when you call 'init'`);
        }
    }

    private isAnalyticsClient(token: AnalyticsClient): token is AnalyticsClient {
        return typeof token === 'object' && typeof token.sendEvent !== 'undefined';
    }

    private getPluginKeys(optionsOrEndpoint: string | CoveoUAOptions): string[] {
        if (typeof optionsOrEndpoint === 'string') {
            return Plugins.DefaultPlugins;
        }
        return Array.isArray(optionsOrEndpoint?.plugins) ? optionsOrEndpoint.plugins : Plugins.DefaultPlugins;
    }

    private getEndpoint(optionsOrEndpoint: string | CoveoUAOptions) {
        if (typeof optionsOrEndpoint === 'string') {
            return optionsOrEndpoint || Endpoints.default;
        } else if (optionsOrEndpoint?.endpoint) {
            return optionsOrEndpoint.endpoint;
        }
        return Endpoints.default;
    }

    private getIsCustomEndpoint(optionsOrEndpoint: string | CoveoUAOptions) {
        if (typeof optionsOrEndpoint === 'string') {
            return false;
        } else if (optionsOrEndpoint?.isCustomEndpoint) {
            return optionsOrEndpoint.isCustomEndpoint;
        }
        return false;
    }

    // init initializes a new client intended to be used with a proxy that injects the access token.
    // @param endpoint is the endpoint of your proxy.
    initForProxy(endpoint: string, isCustomEndpoint = false): void {
        if (!endpoint) {
            throw new Error(`You must pass your endpoint when you call 'initForProxy'`);
        }

        if (typeof endpoint !== 'string') {
            throw new Error(`You must pass a string as the endpoint parameter when you call 'initForProxy'`);
        }

        this.client = new CoveoAnalyticsClient({
            endpoint: endpoint,
            isCustomEndpoint: isCustomEndpoint,
        });
    }

    set(keyOrObject: string | any, value: string): void {
        if (typeof keyOrObject === 'string') {
            this.params[keyOrObject] = value;
        } else {
            Object.keys(keyOrObject).map((key) => {
                this.params[key] = keyOrObject[key];
            });
        }
    }

    send(...[event, ...payload]: SendEventArguments): Promise<AnyEventResponse | void> {
        if (typeof this.client == 'undefined') {
            throw new Error(`You must call init before sending an event`);
        }

        if (!event) {
            throw new Error(`You must provide an event type when calling "send".`);
        }

        return this.client.sendEvent(event.toLowerCase(), ...(payload as VariableArgumentsPayload));
    }

    onLoad(callback: Function) {
        if (typeof callback == 'undefined') {
            throw new Error(`You must pass a function when you call 'onLoad'`);
        }

        callback();
    }

    provide(name: string, plugin: PluginClass) {
        this.plugins.provide(name, plugin);
    }

    require(name: string, options: Omit<PluginOptions, 'client'>) {
        if (!this.client) {
            throw new Error(`You must call init before requiring a plugin`);
        }
        this.plugins.require(name, {...options, client: this.client});
    }

    callPlugin(pluginName: string, fn: string, ...args: any): any {
        if (!this.client) {
            throw new Error(`You must call init before calling a plugin function`);
        }
        return this.plugins.execute(pluginName, fn, ...args);
    }

    reset() {
        this.client = undefined;
        this.plugins = new Plugins();
        this.params = {};
    }

    version(): string {
        return libVersion;
    }
}

export const coveoua = new CoveoUA();
export const getCurrentClient = () => coveoua.client;

export const handleOneAnalyticsEvent = (command: string, ...params: any[]) => {
    const [, trackerName, pluginName, fn] = /^(?:(\w+)\.)?(?:(\w+):)?(\w+)$/.exec(command)!;

    const actionFunction = (<any>coveoua)[fn];
    if (pluginName && fn) {
        return coveoua.callPlugin(pluginName as string, fn, ...params);
    } else if (actionFunction) {
        return actionFunction.apply(coveoua, params);
    } else {
        const actions: AvailableActions[] = [
            'init',
            'set',
            'send',
            'onLoad',
            'callPlugin',
            'reset',
            'require',
            'provide',
            'version',
        ];
        throw new Error(`The action "${command}" does not exist. Available actions: ${actions.join(', ')}.`);
    }
};

export default handleOneAnalyticsEvent;
