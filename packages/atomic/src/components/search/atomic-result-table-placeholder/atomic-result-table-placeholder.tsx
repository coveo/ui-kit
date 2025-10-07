import {Component, h, Prop} from '@stencil/core';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  getItemDisplayClasses,
} from '../../common/layout/display-options';

const placeholderClasses = 'block bg-neutral rounded';

/**
 * The `atomic-result-table-placeholder` component provides an intermediate visual state that is rendered before the first results are available.
 * @internal
 */
@Component({
  tag: 'atomic-result-table-placeholder',
  styleUrl: 'atomic-result-table-placeholder.pcss',
  shadow: true,
})
export class AtomicResultTablePlaceholder {
  @Prop() density!: ItemDisplayDensity;
  @Prop() imageSize!: ItemDisplayImageSize;
  @Prop() rows!: number;

  private getClasses() {
    return getItemDisplayClasses('table', this.density, this.imageSize);
  }

  public render() {
    return (
      <table class={`list-root animate-pulse ${this.getClasses().join(' ')}`}>
        <thead aria-hidden="true">
          <tr>
            <th>
              <div
                class={`mt-2 h-8 ${placeholderClasses}`}
                style={{width: '14.5rem'}}
              ></div>
            </th>
            <th>
              <div
                class={`mt-2 h-8 ${placeholderClasses}`}
                style={{width: '9.75rem'}}
              ></div>
            </th>
            <th>
              <div
                class={`mt-2 h-8 ${placeholderClasses}`}
                style={{width: '6.5rem'}}
              ></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({length: this.rows}, () => (
            <tr>
              <td>
                <div
                  class={`mb-6 h-8 ${placeholderClasses}`}
                  style={{width: '22.875rem'}}
                ></div>
                <div
                  class={`mb-2 h-5 ${placeholderClasses}`}
                  style={{width: '23.75rem'}}
                ></div>
                <div
                  class={`h-5 ${placeholderClasses}`}
                  style={{width: '11.5rem'}}
                ></div>
              </td>
              <td>
                <div
                  class={`mt-1.5 h-5 ${placeholderClasses}`}
                  style={{width: '11rem'}}
                ></div>
              </td>
              <td>
                <div
                  class={`mt-1.5 h-5 ${placeholderClasses}`}
                  style={{width: '4.875rem'}}
                ></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
