import {NgComponentOutlet} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Type,
  computed,
  input,
  output,
} from '@angular/core';
import {RenderableCommerceSurface} from '../models';
import {BundleDisplayComponent} from './bundle-display.component';
import {ComparisonSummaryComponent} from './comparison-summary.component';
import {ComparisonTableComponent} from './comparison-table.component';
import {NextActionsBarComponent} from './next-actions-bar.component';
import {ProductCarouselComponent} from './product-carousel.component';

export const SURFACE_COMPONENTS: Record<string, Type<unknown>> = {
  ProductCarousel: ProductCarouselComponent,
  ComparisonTable: ComparisonTableComponent,
  ComparisonSummary: ComparisonSummaryComponent,
  BundleDisplay: BundleDisplayComponent,
  NextActionsBar: NextActionsBarComponent,
};

@Component({
  selector: 'app-surface-outlet',
  imports: [NgComponentOutlet],
  template: `
    @if (component()) {
      <ng-container
        *ngComponentOutlet="component(); inputs: componentInputs()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurfaceOutletComponent {
  readonly surface = input.required<RenderableCommerceSurface>();
  readonly quickAction = output<string>();

  private readonly forwardQuickAction = (action: string): void => {
    this.quickAction.emit(action);
  };

  protected readonly component = computed(
    () => SURFACE_COMPONENTS[this.surface().componentType] ?? null
  );

  protected readonly componentInputs = computed<Record<string, unknown>>(() => {
    const surface = this.surface();

    if (surface.componentType === 'NextActionsBar') {
      return {
        surface,
        onSelectAction: this.forwardQuickAction,
      };
    }

    return {surface};
  });
}
