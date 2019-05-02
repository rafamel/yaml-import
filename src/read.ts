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

  const opts = Object.assign({ safe: true }, options);

  return yaml[opts.safe ? 'safeLoad' : 'load'](src, {
    ...opts,
    filename: input,
    schema: getSchema(dir, opts, schemas)
  });
}
