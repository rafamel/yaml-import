import { LoadOptions } from 'js-yaml';

export interface IOptions extends LoadOptions {
  /**
   * List of extensions to use for directory imports. Defaults to `['.yml', '.yaml']`.
   */
  ext?: string[];
  /**
   * Whether `safeLoad` or `load` should be used when loading YAML files via *js-yaml*. Defaults to `true`.
   */
  safe?: boolean;
}
