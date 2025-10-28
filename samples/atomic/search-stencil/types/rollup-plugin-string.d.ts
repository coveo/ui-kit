declare module 'rollup-plugin-string' {
  import type {Plugin} from 'rollup';

  interface RollupStringOptions {
    include?: string | string[];
    exclude?: string | string[];
  }

  export function string(options?: RollupStringOptions): Plugin;

  export default string;
}
