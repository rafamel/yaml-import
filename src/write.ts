import fs from 'node:fs';

import { dump } from 'js-yaml';

import type { Options } from './definitions';
import { read } from './read';

export function write(
  source: string,
  destination: string,
  options?: Options | null
): void {
  fs.writeFileSync(destination, dump(read(source, options)));
}
