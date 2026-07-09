import path from 'node:path';
import process from 'node:process';

import arg from 'arg';
import { flags, loadPackage, safePairs } from 'cli-belt';
import { stripIndent as indent } from 'common-tags';
import { dump } from 'js-yaml';

import type { Options } from '../definitions';
import { read } from '../read';
import { write } from '../write';

export async function main(
  argv: string[],
  print: (data: any) => void
): Promise<void> {
  const pkg = await loadPackage(import.meta.dirname, { title: true });
  const help = indent`
    ${pkg.description || ''}

    Usage:
      $ yimp file [options]

    Options:
      -o, --output <path>       Path to output file, optional
      -e, --ext <extensions>    Extensions, comma separated, optional
      -h, --help                Show help
      -v, --version             Show version number

    Example:
      $ yimp source.yml -o destination.yml -e yml,yaml,raml
  `;

  const types = {
    '--output': String,
    '--ext': String,
    '--help': Boolean,
    '--version': Boolean
  };

  const { options: base, aliases } = flags(help);
  safePairs(types, base, { fail: true, bidirectional: true });
  Object.assign(types, aliases);
  const cmd = arg(types, {
    argv,
    permissive: false,
    stopAtPositional: false
  });

  if (cmd['--help']) return print(help);
  if (cmd['--version']) return print(pkg.version);
  if (!cmd._.length) {
    print(help + '\n');
    throw new Error(`A source file is required`);
  } else if (cmd._.length > 1) {
    print(help + '\n');
    throw new Error(`No more than once source file is allowed`);
  }

  const source = path.resolve(process.cwd(), cmd._[0]);
  const destination = cmd['--output']
    ? path.resolve(process.cwd(), cmd['--output'])
    : undefined;
  const options: Options = cmd['--ext']
    ? {
        extensions: cmd['--ext']
          .split(',')
          .map((ext) => (ext[0] === '.' ? ext : `.${ext}`))
      }
    : {};

  if (destination) {
    write(source, destination, options);
  } else {
    print(dump(read(source, options)).trim());
  }
}
