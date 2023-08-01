import {Controller} from '../../controllers';

export interface ControllersPropsMap {
  [customName: string]: unknown;
}

export interface ControllersMap {
  [customName: string]: Controller;
}

export interface OptionsExtender<TOptions> {
  (options: TOptions): TOptions | Promise<TOptions>;
}
