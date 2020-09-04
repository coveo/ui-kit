import {Component, Prop, h, Listen} from '@stencil/core';
import {
  HeadlessEngine,
  searchPageReducers,
  Engine,
  HeadlessConfigurationOptions,
  SearchActions,
  AnalyticsActions,
} from '@coveo/headless';
import {Schema, StringValue} from '@coveo/bueno';
import {RenderError} from '../../utils/render-utils';
import {InitializeEvent} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-search-interface',
  shadow: true,
})
export class AtomicSearchInterface {
  @Prop() sample = false;
  @Prop() organizationId?: string;
  @Prop() accessToken?: string;
  @Prop() renewAccessToken?: () => Promise<string>;
  @RenderError() error?: Error;

  private engine?: Engine;
  private hangingComponentsInitialization: InitializeEvent[] = [];

  constructor() {
    // TODO: Initialize only when accessToken is available
    this.initialize();
  }

  @Listen('atomic/initializeComponent')
  handleInitialization(event: InitializeEvent) {
    event.stopPropagation();

    if (this.engine) {
      event.detail(this.engine);
      return;
    }

    this.hangingComponentsInitialization.push(event);
  }

  private initialize() {
    const config = this.configuration;
    if (!config) {
      this.error = new Error(
        'The atomic-search-interface component configuration is faulty, see the console for more details.'
      );
      return;
    }

    this.engine = new HeadlessEngine({
      configuration: config,
      reducers: searchPageReducers,
    });

    this.initializeComponents();

    this.engine!.dispatch(
      SearchActions.executeSearch(AnalyticsActions.logInterfaceLoad())
    );
  }

  private initializeComponents() {
    this.hangingComponentsInitialization.forEach((event) =>
      event.detail(this.engine!)
    );

    this.hangingComponentsInitialization = [];
  }

  private get configuration(): HeadlessConfigurationOptions | null {
    if (this.sample) {
      if (this.organizationId || this.accessToken) {
        console.warn(
          'You have a conflicting configuration on the atomic-search-interface component.',
          'When the sample prop is defined, the access-token and organization-id should not be defined and will be ignored.'
        );
      }
      return HeadlessEngine.getSampleConfiguration();
    }

    try {
      new Schema({
        organizationId: new StringValue({emptyAllowed: false, required: true}),
        accessToken: new StringValue({emptyAllowed: false, required: true}),
      }).validate({
        organizationId: this.organizationId,
        accessToken: this.accessToken,
      });
    } catch (error) {
      console.error(error);
      return null;
    }

    return {
      accessToken: this.accessToken!,
      organizationId: this.organizationId!,
      renewAccessToken: this.renewAccessToken,
    };
  }

  public render() {
    return <slot></slot>;
  }
}
