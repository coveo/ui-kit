import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-label-and-field-value',
  templateUrl: './label-and-field-value.component.html',
})
export class LabelAndFieldValueComponent {
  @Input('field') field!: string;
  @Input('label') label!: string;

  constructor() {}
}
