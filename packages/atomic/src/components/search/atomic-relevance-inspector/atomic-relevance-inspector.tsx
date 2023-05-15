import {PlatformEnvironment, getOrganizationEndpoints} from '@coveo/headless';
import {Component, h, Prop, Event, EventEmitter} from '@stencil/core';
import {Button} from '../../common/button';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-relevance-inspector` component is used internally to offer insight on search page relevance, as well as information to help troubleshoot issues during development.
 */
@Component({
  tag: 'atomic-relevance-inspector',
  styleUrl: 'atomic-relevance-inspector.pcss',
  shadow: true,
})
export class AtomicRelevanceInspector {
  /**
   * The Atomic interface bindings, namely the headless search engine and i18n instances.
   */
  @Prop() bindings!: Bindings;

  @Prop({reflect: true}) open = false;

  @Event({eventName: 'atomic/relevanceInspector/close'})
  closeRelevanceInspector: EventEmitter<null> | undefined;

  public render() {
    return (
      <atomic-modal
        exportparts="footer"
        isOpen={this.open}
        close={() => {
          this.closeRelevanceInspector?.emit();
        }}
      >
        <p slot="header">Open the relevance inspector</p>
        <p slot="body">
          The Relevance Inspector will open in the Coveo Administration Console.
        </p>
        <div slot="footer" class="w-full flex justify-end items-center">
          <Button
            style="outline-primary"
            class="p-2 mr-2"
            onClick={() => this.closeRelevanceInspector?.emit()}
          >
            Ignore
          </Button>
          <a
            class="btn-primary p-2"
            target="_blank"
            href={this.adminHref}
            onClick={() => this.closeRelevanceInspector?.emit()}
          >
            Open
          </a>
        </div>
      </atomic-modal>
    );
  }

  private extractEnvironmentFromPlatformURL(): PlatformEnvironment {
    const {platformUrl} = this.bindings.engine.state.configuration;
    const fallbackEnv = 'prod';

    const platformUrlMatch = platformUrl.match(
      /^https:\/\/platform(?<env>dev|stg|hipaa)/
    );

    if (platformUrlMatch) {
      return (
        (platformUrlMatch.groups?.env as PlatformEnvironment) ?? fallbackEnv
      );
    }

    const organizationEndpointMatch = platformUrl.match(
      /^https:\/\/[a-z0-9]+\.org(?<env>dev|stg|hipaa)/
    );

    if (organizationEndpointMatch) {
      return (
        (organizationEndpointMatch.groups?.env as PlatformEnvironment) ??
        fallbackEnv
      );
    }

    return fallbackEnv;
  }

  private get adminHref() {
    const {organizationId} = this.bindings.engine.state.configuration;

    const {admin} = getOrganizationEndpoints(
      organizationId,
      this.extractEnvironmentFromPlatformURL() as PlatformEnvironment
    );
    const {searchResponseId} = this.bindings.engine.state.search;
    return `${admin}/admin/#/${organizationId}/search/relevanceInspector/${searchResponseId}`;
  }
}
