import path from 'path';
import fs from 'fs';
import recursivedir from 'fs-readdir-recursive';
import { IOptions, IFileDefinition } from '~/types';

export default function getFiles(
  paths: string[],
  directory: string,
  options: IOptions,
  recursive?: boolean
): IFileDefinition[] {
  return paths.reduce((acc: IFileDefinition[], file: string) => {
    const stat = fs.statSync(path.join(directory, file));
    return stat.isDirectory()
      ? acc.concat(
          getFromDir(path.join(directory, file), options, recursive).map(
            (item) => ({
              cwd: directory,
              dir: file,
              file: item
            })
          )
        )
      : acc.concat({
          cwd: directory,
          dir: path.dirname(file),
          file: path.basename(file)
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
