import path from 'path';
import fs from 'fs';
import recursivedir from 'fs-readdir-recursive';
import { IOptions, IFileDefinition } from '~/types';

export default function getFiles(
  paths: string[],
  directory: string,
  options: IOptions
): IFileDefinition[] {
  return paths.reduce((acc: IFileDefinition[], file: string) => {
    const stat = fs.statSync(path.join(directory, file));
    return stat.isDirectory()
      ? acc.concat(
          getRecursiveFromDir(path.join(directory, file), options).map(
            (item) => ({ cwd: directory, dir: file, file: item })
          )
        )
      : acc.concat({
          cwd: directory,
          dir: path.dirname(file),
          file: path.basename(file)
        });
  }, []);
}

export function getRecursiveFromDir(
  absolute: string,
  options: IOptions
): string[] {
  return recursivedir(absolute).filter((file) => {
    const ext = path.extname(file);
    return !options.ext || options.ext.indexOf(ext) !== -1;
  });
}
