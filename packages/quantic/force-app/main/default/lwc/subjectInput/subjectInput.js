import { LightningElement, api } from 'lwc';

export default class SubjectInput extends LightningElement {
    @api label = "Write a descriptive title";
    @api maxLength = 100;
    value = '';
    length = this.value.length;

    handleChange = (e) => {
        this.value = e.target.value;
        this.length = e.target.value.length;
    }

    @api getValue() {
        return this.value;
    }
    @api getLength() {
        return this.length;
    }
}