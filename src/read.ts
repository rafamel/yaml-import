import path from 'node:path';
import fs from 'node:fs';

import { type Schema, load } from 'js-yaml';

import getSchema from './get-schema';
import type { IOptions } from './types';

export default function read(
  input: string,
  options?: IOptions | null,
  schema?: Schema
): any {
  const cwd = path.dirname(input);
  const src = fs.readFileSync(input, 'utf8');

  return load(src, {
    ...options,
    filename: input,
    schema: getSchema(cwd, options, schema)
  });
}
