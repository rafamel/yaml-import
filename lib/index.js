'use strict';
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const recursivedir = require('fs-readdir-recursive');
const namify = require('namify');

function read(input, options = {}) {
    const dir = path.dirname(input);
    const src = fs.readFileSync(input, 'utf8');

    options.schema = getSchema(dir, options);
    if (!options.hasOwnProperty('filename')) {
        options.filename = input;
    }
    if (!options.hasOwnProperty('safe')) {
        options.safe = true;
    }
    return options.safe
        ? yaml.safeLoad(src, options)
        : yaml.load(src, options);
}

function getSchema(dir, options = {}) {
    if (!options.hasOwnProperty('ext')
        || !Array.isArray(options.ext)) {
        options.ext = ['.yml', '.yaml'];
    }
    const dirFiles = (data) => {
        return recursivedir(path.join(dir, data))
            .filter(x => {
                const ext = path.extname(x);
                return (options.ext.indexOf(ext) !== -1);
            });
    };
    const filesMergeConstruct = data => {
        let ans;
        const arr = data
            .map(x => read(path.join(dir, x), options));
        const notAllObjs = arr.reduce((acc, x) => {
            return acc || !typeof x === 'object' || Array.isArray(x);
        }, false);

        if (notAllObjs) {
            // If not all elements are objects, concatenate as array
            ans = arr.reduce((acc, x) => acc.concat(x), []);
        } else {
            // If all elements are objects, merge into one object
            ans = {};
            for (let obj of arr) {
                for (let key of Object.keys(obj)) {
                    ans[key] = obj[key];
                }
            }
        }
        return ans;
    };
    const types = [
        new yaml.Type('tag:yaml.org,2002:import/single', {
            kind: 'scalar',
            resolve(data) { return (typeof data === 'string'); },
            construct(data) {
                return read(path.join(dir, data), options);
            }
        }),
        new yaml.Type('tag:yaml.org,2002:import/merge', {
            kind: 'sequence',
            resolve(data) {
                return (Array.isArray(data) && data.length > 0);
            },
            construct(data) { return filesMergeConstruct(data); }
        }),
        new yaml.Type('tag:yaml.org,2002:import/dirMerge', {
            kind: 'scalar',
            resolve(data) { return (typeof data === 'string'); },
            construct(data) {
                const files = dirFiles(data)
                    .map(x => path.join(data, x));
                return filesMergeConstruct(files);
            }
        }),
        new yaml.Type('tag:yaml.org,2002:import/dirMap', {
            kind: 'scalar',
            resolve(data) { return (typeof data === 'string'); },
            construct(data) {
                const obj = {};
                dirFiles(data).forEach(x => {
                    const content = read(path.join(dir, data, x), options);
                    // Get keys
                    let keys = x.split(path.sep);
                    keys[keys.length - 1] = path.basename(
                        keys[keys.length - 1], path.extname(keys[keys.length - 1])
                    );
                    keys = keys.map(key => namify(key));

                    // Content to obj keys
                    let objKey = obj;
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i];
                        if (!objKey.hasOwnProperty(key)) {
                            objKey[key] = (i === keys.length - 1)
                                ? content
                                : {};
                        }
                        objKey = objKey[key];
                    }
                });
                return obj;
            }
        }),
        new yaml.Type('tag:yaml.org,2002:import/dirSeq', {
            kind: 'scalar',
            resolve(data) { return (typeof data === 'string'); },
            construct(data) {
                const arr = [];
                dirFiles(data).forEach(x => {
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

module.exports = {
    read,
    write(input, output, options) {
        fs.writeFileSync(output, yaml.dump(read(input, options)));
    },
    getSchema
};
