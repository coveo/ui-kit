import '@/src/components/common/atomic-component-error/atomic-component-error.js';
import type {LogLevel} from '@coveo/headless';
import {i18n, TFunction} from 'i18next';
import Backend from 'i18next-http-backend';
import {html} from 'lit';
import type {
  AnyBindings,
  AnyEngineType,
} from '@/src/components/common/interface/bindings.js';
import {
  i18nBackendOptions,
  i18nTranslationNamespace,
  init18n,
} from '@/src/components/common/interface/i18n.js';
import {setCoveoGlobal} from '@/src/global/environment.js';
import {loadDayjsLocale} from '@/src/utils/dayjs-locales.js';

export type InitializeEventHandler = (bindings: AnyBindings) => void;
export type InitializeEvent = CustomEvent<InitializeEventHandler>;

export interface BaseAtomicInterface<EngineType extends AnyEngineType> {
  analytics: boolean;
  i18n: i18n;
  engine?: EngineType;
  languageAssetsPath: string;
  iconAssetsPath: string;
  logLevel?: LogLevel;
  language?: string;
  bindings: AnyBindings;
  error?: Error;
  updateIconAssetsPath(): void;
  registerFieldsToInclude?: () => void;
}

export const mismatchedInterfaceAndEnginePropError = (
  interfaceKind: 'search' | 'recommendation',
  configurationName: 'query pipeline' | 'search hub'
) =>
  `A ${configurationName} is configured on the ${interfaceKind} interface element, but the ${interfaceKind} interface was initialized with an engine. You should only configure the ${configurationName} in the target engine.`;

export class CommonAtomicInterfaceHelper<Engine extends AnyEngineType> {
  private i18nPromise!: Promise<TFunction>;
  private hangingComponentsInitialization: InitializeEvent[] = [];

  constructor(
    private atomicInterface: BaseAtomicInterface<Engine> & HTMLElement,
    globalVariableName: string
  ) {
    setCoveoGlobal(globalVariableName);

    if ('connectedCallback' in atomicInterface && 'render' in atomicInterface) {
      const {
        connectedCallback: originalConnectedCallback,
        render: originalRender,
      } = atomicInterface;

      atomicInterface.connectedCallback = () => {
        this.i18nPromise = init18n(atomicInterface);

        if (typeof originalConnectedCallback === 'function') {
          return originalConnectedCallback.call(atomicInterface);
        }
        return;
      };

      atomicInterface.render = () => {
        if (atomicInterface.error) {
          return html`<atomic-component-error
            .element=${atomicInterface}
            .error=${atomicInterface.error}
          ></atomic-component-error>`;
        }

        return typeof originalRender === 'function'
          ? originalRender.call(atomicInterface)
          : null;
      };
    } else {
      this.i18nPromise = init18n(atomicInterface);
    }
  }

  public onComponentInitializing(event: InitializeEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.atomicInterface.engine) {
      event.detail(this.atomicInterface.bindings);
      return;
    }

    this.hangingComponentsInitialization.push(event);
  }

  public async onInitialization(initEngine: () => void) {
    if (this.atomicInterface.engine) {
      this.atomicInterface.engine.logger.warn(
        `The ${this.interfaceTagname} component "initialize" has already been called.`,
        this.atomicInterface
      );
      return;
    }

    this.atomicInterface.updateIconAssetsPath();
    initEngine();
    if (this.atomicInterface.registerFieldsToInclude) {
      this.atomicInterface.registerFieldsToInclude();
    }
    loadDayjsLocale(this.atomicInterface.language || 'en');
    await this.i18nPromise;
    this.initComponents();
  }

  public onAnalyticsChange() {
    const {engine, analytics} = this.atomicInterface;
    if (!this.engineIsCreated(engine)) {
      return;
    }

    if (!analytics) {
      engine.disableAnalytics();
      return;
    }

    engine.enableAnalytics();
  }

  public onLanguageChange(newLanguage?: string) {
    const language = newLanguage ?? this.atomicInterface.language;
    const languageWithFallback = language ?? 'en';
    const {i18n} = this.atomicInterface;

    loadDayjsLocale(languageWithFallback);
    new Backend(i18n.services, i18nBackendOptions(this.atomicInterface)).read(
      languageWithFallback.split('-')[0],
      i18nTranslationNamespace,
      (_: unknown, data: unknown) => {
        i18n.addResourceBundle(
          languageWithFallback.split('-')[0],
          i18nTranslationNamespace,
          data,
          true,
          false
        );
        i18n.changeLanguage(language);
      }
    );
  }

  public engineIsCreated(engine?: Engine): engine is Engine {
    if (!engine) {
      console.error(
        `You have to call "initialize" on the ${this.interfaceTagname} component before modifying the props or calling other public methods.`,
        this.atomicInterface
      );
      return false;
    }

    return true;
  }

  private get interfaceTagname() {
    return this.atomicInterface.tagName.toLowerCase();
  }

  private initComponents() {
    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.atomicInterface.bindings)
    );
  }
}
