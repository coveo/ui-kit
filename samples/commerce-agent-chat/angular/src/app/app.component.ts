import {CommonModule} from '@angular/common';
import {Component, CUSTOM_ELEMENTS_SCHEMA, inject} from '@angular/core';

import {ChatService} from './chat.service';
import {MessageInputComponent} from './components/message-input.component';
import {MessageListComponent} from './components/message-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MessageInputComponent, MessageListComponent],
  templateUrl: './app.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  private readonly chatService = inject(ChatService);
  readonly state = this.chatService.state;

  sendMessage(content: string): void {
    this.chatService.sendMessage(content);
  }

  clearMessages(): void {
    this.chatService.clearMessages();
  }

  dismissError(): void {
    this.chatService.dismissError();
  }
}
