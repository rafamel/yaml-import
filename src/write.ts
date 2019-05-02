import fs from 'fs';
import yaml from 'js-yaml';
import read from './read';
import { IOptions } from './types';

export default function write(
  input: string,
  output: string,
  options: IOptions
): void {
  fs.writeFileSync(output, yaml.dump(read(input, options)));
}
