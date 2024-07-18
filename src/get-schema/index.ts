import path from 'node:path';

import { type Schema, Type } from 'js-yaml';

import type { Options } from '../definitions';
import { defaults } from '../defaults';
import { read } from '../read';
import type { Payload } from './definitions';
import { fetch } from './fetch';
import { combine } from './combine';
import { createTree } from './create-tree';
import { validatePayload } from './validate-payload';

export function getSchema(cwd: string, options?: Options | null): Schema {
  const opts = {
    ...options,
    extensions: options?.extensions || defaults.extensions
  };

  const types = [
    new Type('tag:yaml.org,2002:import/single', {
      kind: 'scalar',
      resolve(file) {
        return typeof file === 'string';
      },
      construct(file) {
        return read(path.resolve(cwd, file), opts);
      }
    }),
    new Type('tag:yaml.org,2002:import/sequence', {
      kind: 'sequence',
      resolve(files) {
        return Array.isArray(files) && files.length > 0;
      },
      construct(files) {
        const payload: Payload = { paths: files, strategy: 'sequence' };
        return combine(fetch(payload, cwd, opts), payload.strategy);
      }
    }),
    new Type('tag:yaml.org,2002:import/shallow', {
      kind: 'sequence',
      resolve(files) {
        return Array.isArray(files) && files.length > 0;
      },
      construct(files) {
        const payload: Payload = { paths: files, strategy: 'shallow' };
        return combine(fetch(payload, cwd, opts), payload.strategy);
      }
    }),
    new Type('tag:yaml.org,2002:import/merge', {
      kind: 'sequence',
      resolve(files) {
        return Array.isArray(files) && files.length > 0;
      },
      construct(files) {
        const payload: Payload = { paths: files, strategy: 'merge' };
        return combine(fetch(payload, cwd, opts), payload.strategy);
      }
    }),
    new Type('tag:yaml.org,2002:import/deep', {
      kind: 'sequence',
      resolve(files) {
        return Array.isArray(files) && files.length > 0;
      },
      construct(files) {
        const payload: Payload = { paths: files, strategy: 'deep' };
        return combine(fetch(payload, cwd, opts), payload.strategy);
      }
    }),
    new Type('tag:yaml.org,2002:import/payload', {
      kind: 'mapping',
      resolve(payload: Payload) {
        return validatePayload(payload);
      },
      construct(payload: Payload) {
        return combine(fetch(payload, cwd, opts), payload.strategy);
      }
    }),
    new Type('tag:yaml.org,2002:import/tree', {
      kind: 'mapping',
      resolve(payload: Payload) {
        return validatePayload(payload);
      },
      construct(payload: Payload) {
        const paths = Array.isArray(payload.paths)
          ? payload.paths
          : [payload.paths];
        const data = paths
          .map((path) => {
            return createTree(path, cwd, payload.recursive || false, opts);
          })
          .concat(payload.data || []);
        return combine(data, payload.strategy);
      }
    })
  ];
  return (options?.schema || defaults.schema).extend(types);
}
