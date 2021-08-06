import {Component, Element, h, Host, Prop, State} from '@stencil/core';
import {parseAssetURL} from '../../utils/utils';
import {sanitize} from 'dompurify';
import {
  InitializableComponent,
  InitializeBindings,
  Bindings,
} from '../../utils/initialization-utils';

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
export class AtomicIcon implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @Element() host!: HTMLElement;

  /**
   * Specifies the icon to display.
   *
   * When the icon begins with http://, https://, ./ or ../, it will be fetched and displayed.
   * When the icon begins with assets://, it will be displayed from the list of available icons.
   * Otherwise, the icon will be displayed directly as an SVG element.
   */
  @Prop() icon!: string;

  @State() public error!: Error;

  private svg: string | null = null;

  private async fetchIcon(url: string) {
    try {
      const response = await fetch(url);
      if (response.status !== 200 && response.status !== 304) {
        throw new Error(
          `Could not fetch icon from ${url}, got status code ${response.status} (${response.statusText}).`
        );
      }
      return await response.text();
    } catch (e) {
      this.error = e;
      return null;
    }
  }

  public async componentWillRender() {
    const url = parseAssetURL(this.icon);
    this.svg = url ? await this.fetchIcon(url) : this.icon;
  }

  public render() {
    const sanitizedSvg = this.svg
      ? sanitize(this.svg, {
          USE_PROFILES: {svg: true, svgFilters: true},
        })
      : null;
    return <Host innerHTML={sanitizedSvg}></Host>;
  }
}
