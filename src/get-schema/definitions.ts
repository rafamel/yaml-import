export interface Payload {
  paths: string | string[];
  strategy?: Strategy;
  data?: any;
  recursive?: boolean;
}

export type Strategy = 'sequence' | 'shallow' | 'merge' | 'deep';

export interface FileDefinition {
  cwd: string;
  directory: string;
  name: string;
}
