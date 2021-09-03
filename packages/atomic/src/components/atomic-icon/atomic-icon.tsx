import {
  Component,
  Element,
  getElement,
  h,
  Host,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import {parseAssetURL} from '../../utils/utils';
import {sanitize} from 'dompurify';

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
export class AtomicIcon {
  @Element() host!: HTMLElement;

  /**
   * The SVG icon to display.
   *
   * - Use a value that starts with `http://`, `https://`, `./`, or `../`, to fetch and display an icon from a given location.
   * - Use a value that starts with `assets://`, to display an icon from the Atomic package.
   * - Use a stringified SVG to display it directly.
   */
  @Prop() icon!: string;

  private error: Error | null = null;
  @State() private svg: string | null = null;
  private deferRenderingPromise?: Promise<unknown>;

  private async fetchIcon(url: string) {
    try {
      const response = await fetch(url);
      if (response.status !== 200 && response.status !== 304) {
        throw new Error(
          `Could not fetch icon from ${url}, got status code ${response.status} (${response.statusText}).`
        );
      }
      this.error = null;
      return await response.text();
    } catch (e) {
      this.error = e;
      return null;
    }
  }

  private async getIcon() {
    const url = parseAssetURL(this.icon);
    const svg = url ? await this.fetchIcon(url) : this.icon;
    const sanitizedSvg = svg
      ? sanitize(svg, {
          USE_PROFILES: {svg: true, svgFilters: true},
        })
      : null;
    return sanitizedSvg;
  }

  @Watch('icon')
  public async updateIcon() {
    const svgPromise = this.getIcon();
    this.deferRenderingPromise = svgPromise;
    this.svg = await svgPromise;
  }

  public componentWillLoad() {
    this.updateIcon();
  }

  public async componentWillRender() {
    await this.deferRenderingPromise;
  }

  public render() {
    if (this.error) {
      return (
        <atomic-component-error
          element={getElement(this)}
          error={this.error}
        ></atomic-component-error>
      );
    }
    return <Host innerHTML={this.svg}></Host>;
  }
}
