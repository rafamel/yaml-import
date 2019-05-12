import path from 'path';
import fs from 'fs';
import recursivedir from 'fs-readdir-recursive';
import { IOptions, IFileDefinition } from '~/types';
import absolute from './absolute';

export default function getFiles(
  paths: string[],
  cwd: string,
  options: IOptions,
  recursive?: boolean
): IFileDefinition[] {
  return paths.reduce((acc: IFileDefinition[], file: string) => {
    file = absolute({ file, cwd });
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
  options: IOptions,
  recursive?: boolean
): string[] {
  const paths = recursive
    ? recursivedir(absolute)
    : fs.readdirSync(absolute).filter((item) => {
        return !fs.statSync(path.join(absolute, item)).isDirectory();
      });

  return paths.filter((file) => {
    const parsed = path.parse(file);
    return (
      parsed.name[0] !== '.' &&
      (!options.ext || options.ext.indexOf(parsed.ext) !== -1)
    );
  });
}
