import {FunctionalComponent, h} from '@stencil/core';
import CannotAccess from '../../../images/cannot-access.svg';
import Indexing from '../../../images/indexing.svg';
import NoConnection from '../../../images/no-connection.svg';
import SearchInactive from '../../../images/search-inactive.svg';
import SomethingWrong from '../../../images/something-wrong.svg';
import {Button} from '../button';
import {AnyBindings} from '../interface/bindings';

const disconnectedException = 'Disconnected';
const noEndpointsException = 'NoEndpointsException';
const invalidTokenException = 'InvalidTokenException';
const organizationIsPausedException = 'OrganizationIsPausedException';

interface QueryErrorDetails {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

interface QueryErrorCommonProps {
  showMoreInfo: boolean;
  onShowMoreInfo: () => void;
  bindings: AnyBindings;
  queryErrorState: {
    hasError: boolean;
    error: {
      /**
       * The HTTP status code.
       */
      statusCode: number;
      /**
       * The error message.
       */
      message: string;
      /**
       * The error stack.
       */
      stack?: string;
      /**
       * The error type.
       */
      type: string;
    } | null;
  };
  setAriaLive: (message: string) => void;
}

export const QueryErrorCommon: FunctionalComponent<QueryErrorCommonProps> = (
  props
) => {
  const renderShowMoreInfo = () => {
    if (!props.showMoreInfo) {
      return (
        <Button
          part="more-info-btn"
          style="primary"
          class="p-3 mt-8"
          onClick={props.onShowMoreInfo}
          text={props.bindings.i18n.t('more-info')}
        ></Button>
      );
    }

    return (
      <pre
        part="error-info"
        class="text-left border border-neutral bg-neutral-light p-3 rounded mt-8 whitespace-pre-wrap"
      >
        <code>{JSON.stringify(props.queryErrorState.error, null, 2)}</code>
      </pre>
    );
  };

  const getOrg = () => {
    return 'state' in props.bindings.engine
      ? props.bindings.engine.state.configuration.organizationId
      : props.bindings.engine.configuration.organizationId;
  };

  const getUrl = () => {
    return 'state' in props.bindings.engine
      ? props.bindings.engine.state.configuration.platformUrl
      : props.bindings.engine.configuration.platformUrl;
  };

  const getErrorType = () => {
    return props.queryErrorState.error!.type;
  };

  const getDetails = (): QueryErrorDetails => {
    switch (getErrorType()) {
      case disconnectedException:
        return {
          icon: NoConnection,
          title: props.bindings.i18n.t('disconnected'),
          description: props.bindings.i18n.t('check-your-connection', {
            url: getUrl(),
            interpolation: {escapeValue: false},
          }),
        };
      case noEndpointsException:
        return {
          icon: Indexing,
          title: props.bindings.i18n.t('no-endpoints', {org: getOrg()}),
          description: props.bindings.i18n.t('add-sources'),
          link: 'https://docs.coveo.com/', // TODO: KIT-1061 update link
        };
      case invalidTokenException:
        return {
          icon: CannotAccess,
          title: props.bindings.i18n.t('cannot-access', {org: getOrg()}),
          description: props.bindings.i18n.t('invalid-token'),
          link: 'https://docs.coveo.com/', // TODO: KIT-1061 update link
        };
      case organizationIsPausedException:
        return {
          icon: SearchInactive,
          title: props.bindings.i18n.t('organization-is-paused', {
            org: getOrg(),
          }),
          description: props.bindings.i18n.t('organization-will-resume', {
            org: getOrg(),
          }),
          link: 'https://docs.coveo.com/l6af0467',
        };
      default:
        return {
          icon: SomethingWrong,
          title: props.bindings.i18n.t('something-went-wrong'),
          description: props.bindings.i18n.t('if-problem-persists'),
        };
    }
  };

  if (!props.queryErrorState.hasError) {
    return;
  }

  const details = getDetails();

  props.setAriaLive(`${details.title} ${details.description}`);

  return (
    <div class="text-center p-8">
      <atomic-icon
        part="icon"
        icon={details.icon}
        class="w-1/2 max-w-lg"
      ></atomic-icon>
      <p part="title" class="text-2xl text-on-background mt-8">
        {details.title}
      </p>
      <p part="description" class="text-lg text-neutral-dark mt-2.5">
        {details.description}
      </p>
      {details.link ? (
        <a
          href={details.link}
          part="doc-link"
          class="btn-primary p-3 mt-10 inline-block"
        >
          {props.bindings.i18n.t('coveo-online-help')}
        </a>
      ) : (
        renderShowMoreInfo()
      )}
    </div>
  );
};
