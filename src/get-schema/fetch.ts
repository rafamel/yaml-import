import path from 'node:path';

import type { Options } from '../definitions';
import { read } from '../read';
import type { Payload } from './definitions';
import { getFiles } from './get-files';

export function fetch(
  payload: Payload,
  directory: string,
  options: Options
): any[] {
  const paths = Array.isArray(payload.paths) ? payload.paths : [payload.paths];
  const files = getFiles(paths, directory, payload.recursive || false, options);

  return files
    .map((file) => {
      return read(path.join(file.cwd, file.directory, file.name), options);
    })
    .concat(Object.hasOwnProperty.call(payload, 'data') ? [payload.data] : []);
}
