import yaml from 'js-yaml';
import path from 'path';
import { IOptions } from '~/types';
import read from '~/read';
import merge from './merge';
import getFiles from './get-files';
import createTree from './create-tree';

export default function getSchema(
  directory: string,
  options?: IOptions | null,
  schemas: yaml.Schema[] = [yaml.DEFAULT_SAFE_SCHEMA]
): yaml.Schema {
  const opts = Object.assign({ ext: ['.yml', '.yaml'] }, options);

  const types = [
    new yaml.Type('tag:yaml.org,2002:import/single', {
      kind: 'scalar',
      resolve(data) {
        return typeof data === 'string';
      },
      construct(data) {
        return read(path.join(directory, data), opts, schemas);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/merge', {
      kind: 'sequence',
      resolve(files) {
        return Array.isArray(files) && files.length > 0;
      },
      construct(files) {
        return merge({ paths: files }, directory, opts, schemas);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/dirMerge', {
      kind: 'scalar',
      resolve(data) {
        return typeof data === 'string';
      },
      construct(dir) {
        return merge({ paths: [dir] }, directory, opts, schemas);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/dirMap', {
      kind: 'scalar',
      resolve(data) {
        return typeof data === 'string';
      },
      construct(dir) {
        return createTree(dir, directory, opts, schemas);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/dirSeq', {
      kind: 'scalar',
      resolve(data) {
        return typeof data === 'string';
      },
      construct(dir) {
        const arr: any[] = [];
        getFiles([dir], directory, opts).forEach((item) => {
          const content = read(
            path.join(item.cwd, item.dir, item.file),
            opts,
            schemas
          );
          arr.push(content);
        });
        return arr;
      }
    })
  ];
  const schema = yaml.Schema.create(schemas, types);
  return schema;
}
