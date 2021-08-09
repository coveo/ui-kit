import {Component, Element, getElement, h, Host, Prop} from '@stencil/core';
import {parseAssetURL} from '../../utils/utils';
import {sanitize} from 'dompurify';

/**
 * The `atomic-icon` component displays an SVG icon with a 1:1 aspect ratio.
 *
 * This component can either display an icon from the list of available icons, a direct link or an SVG element.
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
   * Specifies the icon to display.
   *
   * When the icon begins with http://, https://, ./ or ../, it will be fetched and displayed.
   * When the icon begins with assets://, it will be displayed from the list of available icons.
   * Otherwise, the icon will be displayed directly as an SVG element.
   */
  @Prop() icon!: string;

  private error: Error | null = null;
  private svg: string | null = null;

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

  public async componentWillRender() {
    this.svg = await this.getIcon();
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
