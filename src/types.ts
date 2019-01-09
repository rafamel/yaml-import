import { LoadOptions } from 'js-yaml';

export interface IOpts extends LoadOptions {
  ext?: string[];
  safe?: boolean;
}
