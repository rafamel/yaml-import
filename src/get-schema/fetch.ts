import path from 'node:path';

import type { Schema } from 'js-yaml';

import type { IOptions, IPayload } from '../types';
import read from '../read';
import getFiles from './get-files';

export default function fetch(
  payload: IPayload,
  directory: string,
  options: IOptions,
  schema: Schema
): any[] {
  const paths = Array.isArray(payload.paths) ? payload.paths : [payload.paths];
  const files = getFiles(paths, directory, options, payload.recursive);

  return files
    .map((file) =>
      read(path.join(file.cwd, file.directory, file.name), options, schema)
    )
    .concat(Object.hasOwnProperty.call(payload, 'data') ? [payload.data] : []);
}
