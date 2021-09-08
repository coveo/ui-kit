import {Component, h, Prop} from '@stencil/core';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
  getResultDisplayClasses,
} from '../atomic-result-v1/atomic-result-display-options';

const placeholderClasses = 'block bg-neutral rounded';

/**
 * The `atomic-result-table-placeholder` component provides an intermediate visual state that is rendered before the first results are available.
 * @internal
 */
@Component({
  tag: 'atomic-result-table-placeholder-v1',
  styleUrl: 'atomic-result-table-placeholder.pcss',
  shadow: true,
})
export class AtomicResultTablePlaceholder {
  @Prop() density!: ResultDisplayDensity;
  @Prop() image!: ResultDisplayImageSize;
  @Prop() rows!: number;

  private getClasses() {
    return getResultDisplayClasses('table', this.density, this.image);
  }

  public render() {
    return (
      <table class={`list-root animate-pulse ${this.getClasses().join(' ')}`}>
        <thead>
          <tr>
            <th>
              <div
                class={`h-8 mt-2 ${placeholderClasses}`}
                style={{width: '14.5rem'}}
              ></div>
            </th>
            <th>
              <div
                class={`h-8 mt-2 ${placeholderClasses}`}
                style={{width: '9.75rem'}}
              ></div>
            </th>
            <th>
              <div
                class={`h-8 mt-2 ${placeholderClasses}`}
                style={{width: '6.5rem'}}
              ></div>
            </th>
            <th>
              <div
                class={`h-8 mt-2 ${placeholderClasses}`}
                style={{width: '11rem'}}
              ></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({length: this.rows}, () => (
            <tr>
              <td>
                <div
                  class={`h-8 mb-6 ${placeholderClasses}`}
                  style={{width: '22.875rem'}}
                ></div>
                <div
                  class={`h-5 mb-2 ${placeholderClasses}`}
                  style={{width: '23.75rem'}}
                ></div>
                <div
                  class={`h-5 ${placeholderClasses}`}
                  style={{width: '11.5rem'}}
                ></div>
              </td>
              <td>
                <div
                  class={`h-5 mt-1.5 ${placeholderClasses}`}
                  style={{width: '11rem'}}
                ></div>
              </td>
              <td>
                <div
                  class={`h-5 mt-1.5 ${placeholderClasses}`}
                  style={{width: '4.875rem'}}
                ></div>
              </td>
              <td>
                <div
                  class={`h-5 mt-1.5 ${placeholderClasses}`}
                  style={{width: '9.5rem'}}
                ></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
