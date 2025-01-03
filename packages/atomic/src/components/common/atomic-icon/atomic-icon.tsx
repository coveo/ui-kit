import {
  Component,
  Element,
  forceUpdate,
  h,
  Host,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import DOMPurify from 'dompurify';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {parseAssetURL} from '../../../utils/utils';
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
@Component({
  tag: 'atomic-icon',
  styleUrl: 'atomic-icon.pcss',
  shadow: false,
  assetsDirs: ['assets'],
})
export class AtomicIcon implements InitializableComponent<AnyBindings> {
  @Element() host!: HTMLElement;

  @InitializeBindings() public bindings!: AnyBindings;

  /**
   * The SVG icon to display.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop({reflect: true}) icon!: string;

  public error!: Error;
  @State() private svg: string | null = null;

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
      forceUpdate(this);
      return null;
    }
  }

  private validateSVG(svg: string) {
    if (!/^<svg[\s\S]+<\/svg>$/gm.test(svg)) {
      this.bindings.engine.logger.warn(
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

  @Watch('icon')
  public async updateIcon() {
    const svgPromise = this.getIcon();
    this.svg = await svgPromise;
  }

  public initialize() {
    this.updateIcon();
  }

  public render() {
    if (this.error) {
      console.error(this.error, this.host);
      this.host.remove();
      return;
    }
    return <Host innerHTML={this.svg} aria-hidden="true"></Host>;
  }
}
