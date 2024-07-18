import path from 'node:path';
import fs from 'node:fs';

import recursivedir from 'fs-readdir-recursive';

import type { Options } from '../definitions';
import type { FileDefinition } from './definitions';

export function getFiles(
  paths: string[],
  cwd: string,
  recursive: boolean,
  options: Options
): FileDefinition[] {
  return paths.reduce((acc: FileDefinition[], file: string) => {
    file = path.resolve(cwd, file);
    const stat = fs.statSync(file);
    return stat.isDirectory()
      ? acc.concat(
          getFromDir(file, options, recursive).map((item) => ({
            cwd: file,
            directory: path.dirname(item),
            name: path.basename(item)
          }))
        )
      : acc.concat({
          cwd,
          directory: '.',
          name: path.relative(cwd, file)
        });
  }, []);
}

export function getFromDir(
  absolute: string,
  options: Options,
  recursive?: boolean
): string[] {
  const paths = recursive
    ? recursivedir(absolute)
    : fs.readdirSync(absolute).filter((item) => {
        return !fs.statSync(path.join(absolute, item)).isDirectory();
      });

  return paths.filter((file) => {
    const { name, ext } = path.parse(file);
    return (
      name[0] !== '.' &&
      (!options.extensions || options.extensions.includes(ext))
    );
  });
}
