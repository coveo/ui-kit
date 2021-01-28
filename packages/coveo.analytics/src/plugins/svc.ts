import {EventType} from '../events';
import {uuidv4} from '../client/crypto';
import {convertTicketToMeasurementProtocol} from '../client/measurementProtocolMapping/serviceMeasurementProtocolMapper';
import {BasePlugin, BasePluginEventTypes, PluginClass, PluginOptions} from './BasePlugin';

export const SVCPluginEventTypes = {
    ...BasePluginEventTypes,
};

const allSVCEventTypes = Object.keys(SVCPluginEventTypes).map(
    (key) => SVCPluginEventTypes[key as keyof typeof SVCPluginEventTypes]
);

export type CustomValues = {
    [key: string]: string | number | boolean;
};

export interface TicketProperties {
    id?: string;
    subject?: string;
    description?: string;
    category?: string;
    productId?: string;
    custom?: CustomValues;
}

export type Ticket = TicketProperties;

export class SVCPlugin extends BasePlugin {
    public static readonly Id = 'svc';
    private ticket: Ticket = {};

    constructor({client, uuidGenerator = uuidv4}: PluginOptions) {
        super({client, uuidGenerator});
    }

    protected addHooks(): void {
        this.addHooksForEvent();
        this.addHooksForPageView();
        this.addHooksForSVCEvents();
    }

    setTicket(ticket: Ticket) {
        this.ticket = ticket;
    }

    protected clearPluginData() {
        this.ticket = {};
    }

    private addHooksForSVCEvents() {
        this.client.registerBeforeSendEventHook((eventType, ...[payload]) => {
            return allSVCEventTypes.indexOf(eventType) !== -1 ? this.addSVCDataToPayload(eventType, payload) : payload;
        });
    }

    private addHooksForPageView() {
        this.client.addEventTypeMapping(SVCPluginEventTypes.pageview, {
            newEventType: EventType.collect,
            variableLengthArgumentsNames: ['page'],
            addVisitorIdParameter: true,
            usesMeasurementProtocol: true,
        });
    }

    private addHooksForEvent() {
        this.client.addEventTypeMapping(SVCPluginEventTypes.event, {
            newEventType: EventType.collect,
            variableLengthArgumentsNames: ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'],
            addVisitorIdParameter: true,
            usesMeasurementProtocol: true,
        });
    }

    private addSVCDataToPayload(eventType: string, payload: any) {
        const svcPayload = {
            ...this.getLocationInformation(eventType, payload),
            ...this.getDefaultContextInformation(eventType),
            ...(this.action ? {svcAction: this.action} : {}),
            ...(Object.keys(this.actionData ?? {}).length > 0 ? {svcActionData: this.actionData} : {}),
        };

        const ticketPayload = this.getTicketPayload();
        this.clearData();

        return {
            ...ticketPayload,
            ...svcPayload,
            ...payload,
        };
    }

    private getTicketPayload() {
        return convertTicketToMeasurementProtocol(this.ticket);
    }
}

export const SVC: PluginClass = SVCPlugin;
