import {CommonModule, JsonPipe} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';

import type {ActivityMessage} from '@core/types/agent.js';
import type {A2UISurfaceContent} from '@core/types/commerce.js';

import {CommerceCatalogViewComponent} from './commerce-catalog-view.component';

@Component({
  selector: 'app-activity-renderer',
  standalone: true,
  imports: [CommonModule, JsonPipe, CommerceCatalogViewComponent],
  template: `
    <article class="activity-renderer" aria-label="Agent activity">
      @if (activity.activityType === 'a2ui-surface') {
        <app-commerce-catalog-view
          [content]="surfaceContent"
          [isLoading]="isLoading"
          (actionSelected)="actionSelected.emit($event)"
        />
      } @else {
        <p class="activity-type">{{ activity.activityType }}</p>
        <pre class="activity-content">{{ activity.content | json }}</pre>
      }
    </article>
  `,
})
export class ActivityRendererComponent {
  @Input({required: true}) activity!: ActivityMessage;
  @Input() isLoading = false;
  @Output() actionSelected = new EventEmitter<string>();

  get surfaceContent(): A2UISurfaceContent {
    return this.activity.content as unknown as A2UISurfaceContent;
  }
}
