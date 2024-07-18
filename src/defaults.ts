import { DEFAULT_SCHEMA } from 'js-yaml';

export const defaults = {
  schema: DEFAULT_SCHEMA,
  strategy: 'merge' as const,
  extensions: ['.yml', '.yaml']
};
