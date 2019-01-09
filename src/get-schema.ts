import yaml from 'js-yaml';
import path from 'path';
import recursivedir from 'fs-readdir-recursive';
import namify from 'namify';
import { IOpts } from './types';
import read from './read';

export default function getSchema(dir: string, options: IOpts = {}) {
  if (!options.hasOwnProperty('ext') || !Array.isArray(options.ext)) {
    options.ext = ['.yml', '.yaml'];
  }
  const dirFiles = (data: string) => {
    return recursivedir(path.join(dir, data)).filter((x) => {
      const ext = path.extname(x);
      return !options.ext || options.ext.indexOf(ext) !== -1;
    });
  };
  const filesMergeConstruct = (data: string[]) => {
    let ans: any;
    const arr = data.map((x) => read(path.join(dir, x), options));
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
  };
  const types = [
    new yaml.Type('tag:yaml.org,2002:import/single', {
      kind: 'scalar',
      resolve(data) {
        return typeof data === 'string';
      },
      construct(data) {
        return read(path.join(dir, data), options);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/merge', {
      kind: 'sequence',
      resolve(data) {
        return Array.isArray(data) && data.length > 0;
      },
      construct(data) {
        return filesMergeConstruct(data);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/dirMerge', {
      kind: 'scalar',
      resolve(data) {
        return typeof data === 'string';
      },
      construct(data) {
        const files = dirFiles(data).map((x) => path.join(data, x));
        return filesMergeConstruct(files);
      }
    }),
    new yaml.Type('tag:yaml.org,2002:import/dirMap', {
      kind: 'scalar',
      resolve(data) {
        return typeof data === 'string';
      },
      construct(data) {
        const obj: any = {};
        dirFiles(data).forEach((x) => {
          const content = read(path.join(dir, data, x), options);
          // Get keys
          let keys = x.split(path.sep);
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
    }),
    new yaml.Type('tag:yaml.org,2002:import/dirSeq', {
      kind: 'scalar',
      resolve(data) {
        return typeof data === 'string';
      },
      construct(data) {
        const arr: any[] = [];
        dirFiles(data).forEach((x) => {
          const content = read(path.join(dir, data, x), options);
          arr.push(content);
        });
        return arr;
      }
    })
  ];
  const schema = yaml.Schema.create(types);
  return schema;
}
