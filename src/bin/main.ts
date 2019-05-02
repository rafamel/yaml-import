/* eslint-disable no-console */
import path from 'path';
import { loadPackage, flags, safePairs } from 'cli-belt';
import { stripIndent as indent } from 'common-tags';
import arg from 'arg';
import yaml from 'js-yaml';
import read from '../read';
import write from '../write';

export default async function main(argv: string[]): Promise<void> {
  const pkg = await loadPackage(__dirname, { title: true });

  const help = indent`
    ${pkg.description ? pkg.description : ''}

    Usage:
      $ yimp [options]

    Options:
      -i, --input <path>        Path to input file
      -o, --output <path>       Path to output file, optional
      -e, --ext <extensions>    Extensions, comma separated, optional
      -h, --help                Show help
      -v, --version             Show version number
  `;

  const types = {
    '--input': String,
    '--output': String,
    '--ext': String,
    '--help': Boolean,
    '--version': Boolean
  };

  const { options: base, aliases } = flags(help);
  safePairs(types, base, { fail: true, bidirectional: true });
  Object.assign(types, aliases);
  const cmd = arg(types, { argv, permissive: false, stopAtPositional: true });

  if (cmd['--help']) return console.log(help);
  if (cmd['--version']) return console.log(pkg.version);
  if (cmd._.length) {
    console.log(help + '\n');
    throw Error(`Unexpected command: ${cmd._[0]}`);
  }
  if (!cmd['--input']) {
    console.log(help + '\n');
    throw Error(`Input file path is required`);
  }

  const input = path.isAbsolute(cmd['--input'])
    ? cmd['--input']
    : path.join(process.cwd(), cmd['--input']);
  const output = cmd['--output']
    ? path.isAbsolute(cmd['--output'])
      ? cmd['--output']
      : path.join(process.cwd(), cmd['--output'])
    : undefined;
  const options = cmd['--ext']
    ? {
        ext: cmd['--ext']
          .split(',')
          .map((ext) => (ext[0] === '.' ? ext : `.${ext}`))
      }
    : {};

  if (!output) {
    console.log(yaml.dump(read(input, options)).trim());
  } else {
    write(input, output, options);
  }
}
