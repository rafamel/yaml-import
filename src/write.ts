import fs from 'node:fs';

import yaml from 'js-yaml';

import type { IOptions } from './types';
import read from './read';

export default function write(
  input: string,
  output: string,
  options?: IOptions | null,
  schemas?: yaml.Schema[]
): void {
  fs.writeFileSync(output, yaml.dump(read(input, options, schemas)));
}
