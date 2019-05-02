import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import getSchema from './get-schema';
import { IOptions } from './types';

export default function read(
  input: string,
  options?: IOptions | null,
  schemas?: yaml.Schema[]
): any {
  const dir = path.dirname(input);
  const src = fs.readFileSync(input, 'utf8');

  const opts = Object.assign(
    {
      filename: input,
      safe: true
    },
    options,
    { schema: getSchema(dir, options, schemas) }
  );

  return opts.safe ? yaml.safeLoad(src, opts) : yaml.load(src, opts);
}
