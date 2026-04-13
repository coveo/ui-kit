import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-commerce-comparison-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (text.trim()) {
      <div class="comparison-summary">
        <p class="comparison-summary__text">{{ text }}</p>
      </div>
    }
  `,
  styles: [
    `
      .comparison-summary {
        border: 2px solid rgba(0, 212, 255, 0.2);
        border-radius: 12px;
        background: linear-gradient(
          135deg,
          rgba(22, 45, 66, 0.5) 0%,
          rgba(26, 58, 82, 0.3) 100%
        );
        padding: 0.9rem 1rem;
        backdrop-filter: blur(8px);
      }

      .comparison-summary__text {
        margin: 0;
        font-size: 0.88rem;
        line-height: 1.6;
        color: var(--ink);
      }
    `,
  ],
})
export class CommerceComparisonSummaryComponent {
  @Input() text = '';
}
