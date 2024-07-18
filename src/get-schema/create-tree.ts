import path from 'node:path';

import namify from 'namify';

import type { Options } from '../definitions';
import { read } from '../read';
import { getFiles } from './get-files';

export function createTree(
  file: string,
  directory: string,
  recursive: boolean,
  options: Options
): any {
  const obj: any = {};
  getFiles([file], directory, recursive, options).forEach((item) => {
    const content = read(
      path.join(item.cwd, item.directory, item.name),
      options
    );
    // Get keys
    let keys = path.join(item.directory, item.name).split(path.sep);
    keys[keys.length - 1] = path.basename(
      keys[keys.length - 1],
      path.extname(keys[keys.length - 1])
    );
    keys = keys.map((key) => namify(key));

    // Content to obj keys
    let objKey = obj;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!Object.hasOwnProperty.call(objKey, key)) {
        objKey[key] = i === keys.length - 1 ? content : {};
      }
      objKey = objKey[key];
    }
  });
  return obj;
}
