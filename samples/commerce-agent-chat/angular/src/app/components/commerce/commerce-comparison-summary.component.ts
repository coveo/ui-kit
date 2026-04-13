import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, Component, Input} from '@angular/core';

@Component({
  selector: 'app-commerce-comparison-summary',
  standalone: true,
  imports: [CommonModule],
  template: ` <cac-comparison-summary [text]="text" /> `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommerceComparisonSummaryComponent {
  @Input() text = '';
}
