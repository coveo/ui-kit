import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';
import {initializeBindings} from '@/src/decorators/initialize-bindings';
import {InitializableComponent} from '@/src/decorators/types';
import {watch} from '@/src/decorators/watch';
import {parseAssetURL} from '@/src/utils/utils';
import DOMPurify from 'dompurify';
import {LitElement, svg} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {AnyBindings} from '../interface/bindings';

class IconFetchError extends Error {
  static fromStatusCode(url: string, statusCode: number, statusText: string) {
    return new IconFetchError(url, `status code ${statusCode} (${statusText})`);
  }

  static fromError(url: string, error: unknown) {
    return new IconFetchError(url, 'an error', error);
  }

  private constructor(
    public readonly url: string,
    errorMessage: string,
    public readonly errorObject?: unknown
  ) {
    super(`Could not fetch icon from ${url}, got ${errorMessage}.`);
  }
}

/**
 * The `atomic-icon` component displays an SVG icon with a 1:1 aspect ratio.
 *
 * This component can display an icon from those available in the Atomic package, from a specific location, or as an inline SVG element.
 */
@customElement('atomic-icon')
export class AtomicIcon
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  /**
   * The SVG icon to display.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @property({type: String, reflect: true}) icon!: string;
  @state() private svg: string | null = null;
  @state() error?: Error;

  @initializeBindings() public bindings!: AnyBindings;

  private async fetchIcon(url: string) {
    try {
      const response = await fetch(url).catch((e) => {
        throw IconFetchError.fromError(url, e);
      });
      if (response.status !== 200 && response.status !== 304) {
        throw IconFetchError.fromStatusCode(
          url,
          response.status,
          response.statusText
        );
      }
      return await response.text();
    } catch (e) {
      this.error = e as Error;
      this.requestUpdate(); // TODO: not sure this is needed
      return null;
    }
  }

  private validateSVG(svg: string) {
    if (!/^<svg[\s\S]+<\/svg>$/gm.test(svg)) {
      console.warn(
        'The inline "icon" prop is not an svg element. You may encounter rendering issues.',
        this.icon
      );
    }
  }

  private async getIcon() {
    const url = parseAssetURL(
      this.icon,
      this.bindings.store.state.iconAssetsPath
    );
    const svg = url ? await this.fetchIcon(url) : this.icon;

    if (svg) {
      this.validateSVG(svg);
    }
    const sanitizedSvg = svg
      ? DOMPurify.sanitize(svg, {
          USE_PROFILES: {svg: true, svgFilters: true},
        })
      : null;
    return sanitizedSvg;
  }

  @watch('icon')
  public async updateIcon() {
    const svgPromise = this.getIcon();
    this.svg = await svgPromise;
    // TODO: check if should mark svg as not a state var and trigger a refresh manually
  }

  @bindingGuard()
  @errorGuard()
  render() {
    console.log('rendering icon');
    return svg`${this.svg}`;
  }
}
