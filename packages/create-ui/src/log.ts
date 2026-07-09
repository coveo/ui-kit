import {log as clackLog, note as clackNote} from '@clack/prompts';

export const log = {
  info(message: string): void {
    clackLog.info(message);
  },
  step(message: string): void {
    clackLog.step(message);
  },
  success(message: string): void {
    clackLog.success(message);
  },
  warn(message: string): void {
    clackLog.warn(message);
  },
  error(message: string): void {
    clackLog.error(message);
  },
  note(message: string, title?: string): void {
    clackNote(message, title);
  },
};
