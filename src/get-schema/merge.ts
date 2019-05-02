import path from 'path';
import yaml from 'js-yaml';
import { IOptions, IPayload } from '~/types';
import getFiles from './get-files';
import read from '~/read';

export default function merge(
  payload: IPayload,
  directory: string,
  options: IOptions,
  schemas: yaml.Schema[]
): any {
  const files = getFiles(payload.paths, directory, options).map((item) => {
    return path.join(item.dir, item.file);
  });
  return trunk(directory, options, schemas, files, payload.data);
}

export function trunk(
  directory: string,
  options: IOptions,
  schemas: yaml.Schema[],
  files: string[],
  data?: any
): any {
  let ans: any;
  const arr = files
    .map((x) => read(path.join(directory, x), options, schemas))
    .concat(data || []);
  const notAllObjs: boolean = arr.reduce((acc: boolean, x) => {
    return acc || typeof x !== 'object' || Array.isArray(x);
  }, false);

  if (notAllObjs) {
    // If not all elements are objects, concatenate as array
    ans = arr.reduce((acc, x) => acc.concat(x), []);
  } else {
    // If all elements are objects, merge into one object
    ans = {};
    for (const obj of arr) {
      for (const key of Object.keys(obj)) {
        ans[key] = obj[key];
      }
    }
  }
  return ans;
}
