import {Component, h, Prop} from '@stencil/core';
import {
  ResultDisplayLayout,
  ResultDisplayDensity,
  ResultDisplayImageSize,
  getResultDisplayClasses,
} from '../atomic-result-v1/atomic-result-display-options';

const placeholderClasses = 'block bg-neutral w-full h-full rounded';

/**
 * The `atomic-result-placeholder` component provides an intermediate visual state that is rendered before the first results are available.
 * @internal
 */
@Component({
  tag: 'atomic-result-placeholder-v1',
  styleUrl: 'atomic-result-placeholder.pcss',
  shadow: true,
})
export class AtomicResultPlaceholder {
  @Prop() display!: ResultDisplayLayout;
  @Prop() density!: ResultDisplayDensity;
  @Prop() image!: ResultDisplayImageSize;

  private getClasses() {
    return getResultDisplayClasses(this.display, this.density, this.image);
  }

  private renderExcerptLine(width: string) {
    return (
      <div
        style={{
          height: 'var(--line-height)',
          width,
        }}
      >
        <div
          class={placeholderClasses}
          style={{height: 'var(--font-size)'}}
        ></div>
      </div>
    );
  }

  public render() {
    return (
      <div class={`result-root animate-pulse ${this.getClasses().join(' ')}`}>
        <atomic-result-section-visual>
          <div class={placeholderClasses}></div>
        </atomic-result-section-visual>
        <atomic-result-section-badges>
          <div class={`badge ${placeholderClasses}`}></div>
        </atomic-result-section-badges>
        <atomic-result-section-actions>
          <div class={`action ${placeholderClasses}`}></div>
        </atomic-result-section-actions>
        <atomic-result-section-title>
          <div class={`title ${placeholderClasses}`}></div>
        </atomic-result-section-title>
        <atomic-result-section-excerpt>
          {this.renderExcerptLine('100%')}
          {this.renderExcerptLine('95%')}
          {this.renderExcerptLine('98%')}
        </atomic-result-section-excerpt>
        <atomic-result-section-bottom-metadata>
          <div class="fields-placeholder">
            {Array.from({length: 4}, () => (
              <div
                class={`field-value-placeholder ${placeholderClasses}`}
              ></div>
            ))}
          </div>
        </atomic-result-section-bottom-metadata>
      </div>
    );
  }
}
