import { api, LightningElement } from 'lwc';

import lAccount from '@salesforce/label/c.quantic_objecttype_account';
import lCase from '@salesforce/label/c.quantic_objecttype_case';
import lContact from '@salesforce/label/c.quantic_objecttype_contact';
import lPeople from '@salesforce/label/c.quantic_objecttype_people';
import lThread from '@salesforce/label/c.quantic_objecttype_thread';

export default class ExampleCaptionProvider extends LightningElement {
    labels = {
        Account: lAccount,
        Contact: lContact,
        Case: lCase,
        People: lPeople,
        Thread: lThread,
    };

    @api
    get captions() {
        return this.labels;
    }
}
