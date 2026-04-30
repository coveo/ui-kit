import {createContext} from '@lit/context';

export const answerContext = createContext<string>(Symbol('answer-id'));
