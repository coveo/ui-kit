import {useMemo} from 'react';
import {buildUnifiedConverseController} from '@coveo/thermidor';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {useGenerativeInterface} from '../context/generative-interface.js';
import {useBuildController} from '../hooks/use-build-controller.js';
import {useNavigation} from '../hooks/use-navigation.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {StateSourceProvider} from '../a2ui/state-source-context.js';
import type {EngineStateSource} from '../a2ui/controllers.js';
import {LandingPage} from './LandingPage/LandingPage.js';
import {SearchResultsPage} from './SearchResultsPage/SearchResultsPage.js';
import {ConversationPage} from './ConversationPage/index.js';

const catalog = createThermidorCatalog();

export function AppShell() {
  const generativeInterface = useGenerativeInterface();

  const [controller, converseState] = useBuildController(() =>
    buildUnifiedConverseController({interface: generativeInterface})
  );

  // TODO: Remove wrapper when UnifiedConverseController exposes dispatchAction.
  // Remote controller actions (e.g. selectAction in NextActionsBar) are
  // silently no-op until then.
  const stateSource: EngineStateSource = useMemo(
    () => ({
      get state() {
        return controller.state;
      },
      subscribe: (listener: () => void) => controller.subscribe(listener),
      dispatchAction: async () => {},
    }),
    [controller]
  );

  const nav = useNavigation(controller, converseState);

  return (
    <A2UIProvider catalog={catalog}>
      <StateSourceProvider stateSource={stateSource}>
        <div className="view-shell">
          {nav.commerceSurfaceId && (
            <div className={`view-panel ${nav.view === 'search' ? 'view-panel--active' : ''}`}>
              <SearchResultsPage
                surfaceId={nav.commerceSurfaceId}
                onSubmit={nav.handleSubmit}
                isStreaming={converseState.isStreaming}
                query={nav.persistedQuery}
                onBackToConversation={nav.handleBackToConversation}
                products={nav.targetedProducts}
                onProductsChange={nav.setTargetedProducts}
              />
            </div>
          )}
          {nav.view !== 'search' && (
            <div className="view-panel view-panel--active">
              {nav.view === 'conversation' ? (
                <ConversationPage
                  onSubmit={nav.handleSubmit}
                  isStreaming={converseState.isStreaming}
                  turns={converseState.turns}
                  onBackToSearch={nav.handleBackToSearch}
                  canGoBackToSearch={nav.canGoBackToSearch}
                  products={nav.targetedProducts}
                  onProductsChange={nav.setTargetedProducts}
                />
              ) : (
                <LandingPage onSubmit={nav.handleSubmit} isStreaming={converseState.isStreaming} />
              )}
            </div>
          )}
        </div>
      </StateSourceProvider>
    </A2UIProvider>
  );
}
