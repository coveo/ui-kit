import {Ticket} from '../../plugins/svc';
import {keysOf} from '../utils';

const ticketKeysMapping: {[key in keyof Ticket]: string} = {
    id: 'svc_ticket_id',
    subject: 'svc_ticket_subject',
    description: 'svc_ticket_description',
    category: 'svc_ticket_category',
    productId: 'svc_ticket_product_id',
    custom: 'svc_ticket_custom',
};
const ticketKeysMappingValues = keysOf(ticketKeysMapping).map((key) => ticketKeysMapping[key]);
const ticketSubKeysMatchGroup = [...ticketKeysMappingValues].join('|');
const ticketKeyRegex = new RegExp(`^(${ticketSubKeysMatchGroup}$)`);

export const serviceActionsKeysMapping: {[name: string]: string} = {
    svcAction: 'svc_action',
    svcActionData: 'svc_action_data',
};

export const convertTicketToMeasurementProtocol = (ticket: Ticket) => {
    return keysOf(ticket)
        .filter((key) => ticket[key] !== undefined)
        .reduce((mappedTicket, key) => {
            const newKey = ticketKeysMapping[key] || key;
            return {
                ...mappedTicket,
                [newKey]: ticket[key],
            };
        }, {});
};

const isTicketKey = (key: string) => ticketKeyRegex.test(key);

export const isServiceKey = [isTicketKey];
