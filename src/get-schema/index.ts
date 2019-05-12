import yaml from 'js-yaml';
import { IOptions, IPayload } from '~/types';
import read from '~/read';
import fetch from './fetch';
import merge from './merge';
import createTree from './create-tree';
import validatePayload from './validate-payload';
import absolute from './absolute';

export default function getSchema(
  cwd: string,
  options?: IOptions | null,
  schemas: yaml.Schema[] = [yaml.DEFAULT_SAFE_SCHEMA]
): yaml.Schema {
  const opts = Object.assign({ ext: ['.yml', '.yaml'] }, options);

  const types = [
    new yaml.Type('tag:yaml.org,2002:import/single', {
      kind: 'scalar',
      resolve(file) {
        return typeof file === 'string';
      },
      construct(file) {
        return read(absolute({ file, cwd }), opts, schemas);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/sequence', {
      kind: 'sequence',
      resolve(files) {
        return Array.isArray(files) && files.length > 0;
      },
      construct(files) {
        const payload: IPayload = { paths: files, strategy: 'sequence' };
        return merge(fetch(payload, cwd, opts, schemas), payload.strategy);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/shallow', {
      kind: 'sequence',
      resolve(files) {
        return Array.isArray(files) && files.length > 0;
      },
      construct(files) {
        const payload: IPayload = { paths: files, strategy: 'shallow' };
        return merge(fetch(payload, cwd, opts, schemas), payload.strategy);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/merge', {
      kind: 'sequence',
      resolve(files) {
        return Array.isArray(files) && files.length > 0;
      },
      construct(files) {
        const payload: IPayload = { paths: files, strategy: 'merge' };
        return merge(fetch(payload, cwd, opts, schemas), payload.strategy);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/deep', {
      kind: 'sequence',
      resolve(files) {
        return Array.isArray(files) && files.length > 0;
      },
      construct(files) {
        const payload: IPayload = { paths: files, strategy: 'deep' };
        return merge(fetch(payload, cwd, opts, schemas), payload.strategy);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/payload', {
      kind: 'mapping',
      resolve(payload: IPayload) {
        return validatePayload(payload);
      },
      construct(payload: IPayload) {
        return merge(fetch(payload, cwd, opts, schemas), payload.strategy);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/tree', {
      kind: 'mapping',
      resolve(payload: IPayload) {
        return validatePayload(payload);
      },
      construct(payload: IPayload) {
        const paths = Array.isArray(payload.paths)
          ? payload.paths
          : [payload.paths];
        const data = paths
          .map((path) =>
            createTree(path, cwd, opts, schemas, payload.recursive)
          )
          .concat(payload.data || []);
        return merge(data, payload.strategy);
      }
    })
  ];
  const schema = yaml.Schema.create(schemas, types);
  return schema;
}
