import fs from 'fs';
import yaml from 'js-yaml';
import read from './read';
import { IOpts } from './types';

export default function write(input: string, output: string, options: IOpts) {
  fs.writeFileSync(output, yaml.dump(read(input, options)));
}
