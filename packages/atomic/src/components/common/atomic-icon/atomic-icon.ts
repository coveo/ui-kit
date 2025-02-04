import DOMPurify from 'dompurify';
import {LitElement, nothing} from 'lit';
import {svg} from 'lit-html/static.js';
import {customElement, property, state} from 'lit/decorators.js';
import {bindingGuard} from '../../../decorators/binding-guard.js';
import {initializeBindings} from '../../../decorators/initialize-bindings.js';
import {InitializableComponent} from '../../../decorators/types.js';
import {watch} from '../../../decorators/watch.js';
import {parseAssetURL} from '../../../utils/utils.js';
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

@customElement('lit-atomic-icon')
export class AtomicIcon
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  @initializeBindings()
  @state()
  bindings!: AnyBindings;

  @property({type: String, reflect: true}) icon!: string;
  @state() private svg: string | null = null;
  @state() error?: Error;

  // TODO: styles
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
      this.requestUpdate();
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

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('icon')) {
      this.updateIcon();
    }
  }

  @watch('icon')
  async updateIcon() {
    const svgPromise = this.getIcon();
    this.svg = await svgPromise;
  }

  @bindingGuard()
  render() {
    if (this.error) {
      console.error(this.error, this);
      return nothing;
    }
    // return html`${unsafeHTML(this.svg)}`;
    return svg`${this.svg}`;
  }
}
