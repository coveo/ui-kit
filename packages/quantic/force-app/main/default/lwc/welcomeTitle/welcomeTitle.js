import { api, LightningElement } from 'lwc';

export default class WelcomeTitle extends LightningElement {
  @api heading = 'Hi John, what do you need help with?';
}