import type {LogLevel} from '@coveo/headless';
import type {i18n, TFunction} from 'i18next';
import Backend from 'i18next-http-backend';
import type {LitElement, ReactiveController} from 'lit';
import {setCoveoGlobal} from '@/src/global/environment';
import {loadDayjsLocale} from '@/src/utils/dayjs-locales';
import type {AnyBindings, AnyEngineType} from './bindings';
import {i18nBackendOptions, i18nTranslationNamespace, init18n} from './i18n';
import '@/src/components/common/atomic-aria-live/atomic-aria-live';

export type InitializeEventHandler = (bindings: AnyBindings) => void;
export type InitializeEvent = CustomEvent<InitializeEventHandler>;

export interface BaseAtomicInterface<EngineType extends AnyEngineType> {
  analytics: boolean;
  i18n: i18n;
  languageAssetsPath: string;
  iconAssetsPath: string;
  bindings: AnyBindings;
  updateIconAssetsPath(): void;
  error: Error;
  engine?: EngineType;
  logLevel?: LogLevel;
  language?: string;
  registerFieldsToInclude?: () => void;
}

export class InterfaceController<EngineType extends AnyEngineType>
  implements ReactiveController
{
  private host: LitElement & BaseAtomicInterface<EngineType>;
  private i18nPromise!: Promise<TFunction>;
  private hangingComponentsInitialization: InitializeEvent[] = [];

  constructor(
    host: LitElement & BaseAtomicInterface<EngineType>,
    globalVariableName: string,
    headlessVersion: string
  ) {
    this.host = host;
    this.host.addController(this);
    setCoveoGlobal(globalVariableName, headlessVersion);
  }

  hostConnected() {
    this.i18nPromise = init18n(this.host);
    this.initAriaLive();
  }

  hostDisconnected() {
    this.removeAriaLive();
  }

  public onComponentInitializing(event: InitializeEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.host.engine) {
      event.detail(this.host.bindings);
      return;
    }

    this.hangingComponentsInitialization.push(event);
  }

  public async onInitialization(initEngine: () => void) {
    if (this.host.engine) {
      this.host.engine.logger.warn(
        `The ${this.interfaceTagname} component "initialize" has already been called.`
      );
      return;
    }

    this.host.updateIconAssetsPath();
    initEngine();
    if (this.host.registerFieldsToInclude) {
      this.host.registerFieldsToInclude();
    }
    loadDayjsLocale(this.host.language || 'en');
    await this.i18nPromise;
    this.initComponents();
  }

  public onAnalyticsChange() {
    const {engine, analytics} = this.host;
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
    const language = newLanguage ?? this.host.language;
    const languageWithFallback = language ?? 'en';
    const {i18n} = this.host;

    loadDayjsLocale(languageWithFallback);
    new Backend(i18n.services, i18nBackendOptions(this.host)).read(
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

  public engineIsCreated(engine?: EngineType): engine is EngineType {
    if (!engine) {
      console.error(
        `You have to call "initialize" on the ${this.interfaceTagname} component before modifying the props or calling other public methods.`,
        this.host
      );
      return false;
    }

    return true;
  }

  private get interfaceTagname() {
    return this.host.tagName.toLowerCase();
  }

  private initComponents() {
    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.host.bindings)
    );
  }

  private initAriaLive() {
    if (
      Array.from(this.host.children).some(
        (element) => element.tagName === 'ATOMIC-ARIA-LIVE'
      )
    ) {
      return;
    }
    const ariaLive = document.createElement('atomic-aria-live');
    this.host.prepend(ariaLive);
  }

  private removeAriaLive() {
    const ariaLive = this.host.querySelector('atomic-aria-live');
    if (ariaLive) {
      ariaLive.remove();
    }
  }
}
