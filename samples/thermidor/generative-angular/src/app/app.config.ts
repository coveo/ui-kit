import {
  ApplicationConfig,
  Injector,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  A2UI_RENDERER_CONFIG,
  A2uiRendererService,
  BasicCatalog,
} from '@a2ui/angular/v0_9';
import type {A2uiClientAction} from '@a2ui/web_core/v0_9';
import {CUSTOM_CATALOG} from './a2ui/custom-catalog';
import {ConversationService} from './services/conversation.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: A2UI_RENDERER_CONFIG,
      useFactory: () => {
        const injector = inject(Injector);
        return {
          catalogs: [new BasicCatalog(), CUSTOM_CATALOG],
          actionHandler: (action: A2uiClientAction) => {
            const conversationService = injector.get(ConversationService);
            conversationService.submit(String(action.context['payload'] ?? ''));
          },
        };
      },
    },
    A2uiRendererService,
  ],
};
