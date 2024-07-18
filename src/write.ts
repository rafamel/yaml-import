import fs from 'node:fs';

import { type Schema, dump } from 'js-yaml';

import type { IOptions } from './types';
import read from './read';

export default function write(
  input: string,
  output: string,
  options?: IOptions | null,
  schema?: Schema
): void {
  fs.writeFileSync(output, dump(read(input, options, schema)));
}
