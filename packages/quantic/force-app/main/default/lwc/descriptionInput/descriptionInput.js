import { LightningElement, api } from 'lwc';

export default class DescriptionInput extends LightningElement {
    @api label = "Explain the problem";
    value = '';
    formats = [
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'indent',
        'clean',
        'table',
        'header',
    ];

    handleChange(event) {
        this.value = event.target.value;
    }

    @api getValue() {
        return this.value;
    }
}