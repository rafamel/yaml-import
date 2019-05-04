import path from 'path';
import yaml from 'js-yaml';
import namify from 'namify';
import getFiles from './get-files';
import read from '~/read';
import { IOptions } from '~/types';

export default function createMapping(
  file: string,
  directory: string,
  options: IOptions,
  schemas: yaml.Schema[]
): any {
  const obj: any = {};
  getFiles([file], directory, options).forEach((item) => {
    const content = read(
      path.join(directory, item.dir, item.file),
      options,
      schemas
    );
    // Get keys
    let keys = item.file.split(path.sep);
    keys[keys.length - 1] = path.basename(
      keys[keys.length - 1],
      path.extname(keys[keys.length - 1])
    );
    keys = keys.map((key) => namify(key));

    // Content to obj keys
    let objKey = obj;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (!objKey.hasOwnProperty(key)) {
        objKey[key] = i === keys.length - 1 ? content : {};
      }
      objKey = objKey[key];
    }
  });
  return obj;
}