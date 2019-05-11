import path from 'path';
import yaml from 'js-yaml';
import { IOptions, IPayload } from '~/types';
import getFiles from './get-files';
import read from '~/read';

export default function fetch(
  payload: IPayload,
  directory: string,
  options: IOptions,
  schemas: yaml.Schema[]
): any[] {
  const paths = Array.isArray(payload.paths) ? payload.paths : [payload.paths];
  const files = getFiles(paths, directory, options, payload.recursive).map(
    (item) => path.join(item.dir, item.file)
  );

  return files
    .map((x) => read(path.join(directory, x), options, schemas))
    .concat(payload.data || []);
}
