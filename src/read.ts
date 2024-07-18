import path from 'node:path';
import fs from 'node:fs';

import { load } from 'js-yaml';

import type { Options } from './definitions';
import { getSchema } from './get-schema';

export function read(source: string, options?: Options | null): any {
  const cwd = path.dirname(source);
  const src = fs.readFileSync(source, 'utf8');

  return load(src, {
    ...options,
    filename: options?.filename || source,
    schema: getSchema(cwd, options)
  });
}
