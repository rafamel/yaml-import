import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import getSchema from './get-schema';
import { IOptions } from './types';

export default function read(input: string, options: IOptions = {}): any {
  const dir = path.dirname(input);
  const src = fs.readFileSync(input, 'utf8');

  options.schema = getSchema(dir, options);
  if (!options.hasOwnProperty('filename')) {
    options.filename = input;
  }
  if (!options.hasOwnProperty('safe')) {
    options.safe = true;
  }

  return options.safe ? yaml.safeLoad(src, options) : yaml.load(src, options);
}
