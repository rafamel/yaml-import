import path from 'node:path';
import fs from 'node:fs';

import yaml from 'js-yaml';

import getSchema from './get-schema';
import type { IOptions } from './types';

export default function read(
  input: string,
  options?: IOptions | null,
  schemas?: yaml.Schema[]
): any {
  const cwd = path.dirname(input);
  const src = fs.readFileSync(input, 'utf8');

  const opts = Object.assign({ safe: true }, options);
  const yamlOpts = {
    ...opts,
    filename: input,
    schema: getSchema(cwd, opts, schemas)
  };

  return opts.safe ? yaml.safeLoad(src, yamlOpts) : yaml.load(src, yamlOpts);
}
