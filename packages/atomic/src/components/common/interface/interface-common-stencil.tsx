import {setCoveoGlobal} from '@/src/global/environment.js';
import {loadDayjsLocale} from '@/src/utils/dayjs-locales.js';
import {InitializeEvent} from '@/src/utils/initialization-utils.js';
import {LogLevel, VERSION} from '@coveo/headless';
import {ComponentInterface, h} from '@stencil/core';
import {i18n, TFunction} from 'i18next';
import Backend from 'i18next-http-backend';
import {AnyBindings, AnyEngineType} from './bindings';
import {i18nBackendOptions, i18nTranslationNamespace} from './stencil-i18n';
import {init18n} from './stencil-i18n';

export interface StencilBaseAtomicInterface<EngineType extends AnyEngineType>
  extends ComponentInterface {
  analytics: boolean;
  i18n: i18n;
  engine?: EngineType;
  languageAssetsPath: string;
  iconAssetsPath: string;
  logLevel?: LogLevel;
  language?: string;
  host: HTMLElement;
  bindings: AnyBindings;
  error?: Error;
  updateIconAssetsPath(): void;
  registerFieldsToInclude?: () => void; // Fix: Removed the question mark and added a semicolon.
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
    private atomicInterface: StencilBaseAtomicInterface<Engine>,
    globalVariableName: string
  ) {
    setCoveoGlobal(VERSION, globalVariableName);

    const {
      connectedCallback: originalConnectedCallback,
      render: originalRender,
    } = atomicInterface;

    atomicInterface.connectedCallback = () => {
      this.i18nPromise = init18n(atomicInterface);

      return (
        originalConnectedCallback &&
        originalConnectedCallback.call(atomicInterface)
      );
    };

    atomicInterface.render = () => {
      if (atomicInterface.error) {
        return (
          <atomic-component-error
            element={atomicInterface.host}
            error={atomicInterface.error}
          ></atomic-component-error>
        );
      }

      return originalRender && originalRender.call(atomicInterface);
    };
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
        `The ${this.interfaceTagname} component "initialize" has already been called.`
      );
      return;
    }

    this.atomicInterface.updateIconAssetsPath();
    initEngine();
    if (this.atomicInterface.registerFieldsToInclude) {
      this.atomicInterface.registerFieldsToInclude();
    }
    loadDayjsLocale(this.language);
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

  public onLanguageChange() {
    const {i18n, language} = this.atomicInterface;

    loadDayjsLocale(this.language);
    const {resolve, promise} = Promise.withResolvers<void>();
    new Backend(i18n.services, i18nBackendOptions(this.atomicInterface)).read(
      this.language,
      i18nTranslationNamespace,
      async (_: unknown, data: unknown) => {
        i18n.addResourceBundle(
          this.language,
          i18nTranslationNamespace,
          data,
          true,
          false
        );
        await i18n.changeLanguage(language);
        resolve();
      }
    );
    return promise;
  }

  public engineIsCreated(engine?: Engine): engine is Engine {
    if (!engine) {
      console.error(
        `You have to call "initialize" on the ${this.interfaceTagname} component before modifying the props or calling other public methods.`,
        this.atomicInterface.host
      );
      return false;
    }

    return true;
  }

  private get interfaceTagname() {
    return this.atomicInterface.host.tagName.toLowerCase();
  }

  private initComponents() {
    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.atomicInterface.bindings)
    );
  }

  private get language() {
    return this.atomicInterface.language || 'en';
  }
}
