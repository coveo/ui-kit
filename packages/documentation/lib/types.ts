export type NavNode = {
  text?: string;
  path?: string | null;
  children?: NavNode[] | undefined;
  class?: string;
  icon?: string | number;
  [key: string]: unknown;
};
