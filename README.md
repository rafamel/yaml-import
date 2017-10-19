# yaml-import

[![Version](https://img.shields.io/github/package-json/v/rafamel/yaml-import.svg)](https://github.com/rafamel/yaml-import)
[![Build Status](https://travis-ci.org/rafamel/yaml-import.svg)](https://travis-ci.org/rafamel/yaml-import)
[![Coverage](https://img.shields.io/coveralls/rafamel/yaml-import.svg)](https://coveralls.io/github/rafamel/yaml-import?branch=master)
[![Dependencies](https://david-dm.org/rafamel/yaml-import/status.svg)](https://david-dm.org/rafamel/yaml-import)
[![Vulnerabilities](https://snyk.io/test/npm/yaml-import/badge.svg)](https://snyk.io/test/npm/yaml-import)
[![Issues](https://img.shields.io/github/issues/rafamel/yaml-import.svg)](https://github.com/rafamel/yaml-import/issues)
[![License](https://img.shields.io/github/license/rafamel/yaml-import.svg)](https://github.com/rafamel/yaml-import/blob/master/LICENSE)

**Import files and directories in *YAML* for a modular design.**

## Install

[`npm install yaml-import`](https://www.npmjs.com/package/yaml-import)

## *YAML*

With `yaml-import`, the imports are relative to the current *YAML* file.

### `!!import/single` *`file`*

Import the contents of a single file

```yaml
some: 
    - yaml
    - where I
import: a file like
here: !!import/single mydir/myfile.yml
or:
    - like below
    - !!import/single myotherdir/myotherfile.yml
```

### `!!import/merge` *array*

Merge the contents of numerous files into one object or array. 

- If all the files are objects, it will merge all the keys into one single object.
- If one or more of the files contain any other type, it will concatenate an array (so if any of the files is an array itself, all its elements will go into the top level).

```yaml
!!import/merge [
    'mydir/file-one.yml',
    'mydir/file-two.yml',
    'myotherdir/file-three.yml',
]
```

### `!!import/dirMerge` *`dir`*

Same as [`!!import/merge`](#importmerge-array), but with all the files (recursive) within a directory.

```yaml
!!import/dirMerge myNice/dir
```

### `!!import/dirSeq` *`dir`*

It will create a `sequence` (array), and the contents of each of the files found within the directory (recursive) will be an element of the array.

```yaml
!!import/dirSeq myNice/dir
```

### `!!import/dirMap` *`dir`*

It will create an `mapping` (object) with keys equivalent to the directory tree and files (nested).

```yaml
!!import/dirMap myNice/dir
```

## Usage

### `yimp.write(input, output, options)`

Reads a *YAML* file and writes the output on a file.

- `input`: *String*, the path of the file to read.
- `output`: *String*, the path to write the output file.
- `options` (optional): *Object*
    - `ext`: *Array*, list of extensions to use for directory imports. By default, `['.yml', '.yaml']`.
    - `safe`: *Boolean*, whether it should it `safeLoad` or `load` for [js-yaml](https://www.npmjs.com/package/js-yaml) when loading the *YAML* under the hood. `true` by default.
    - [All others offered by js-yaml](https://github.com/nodeca/js-yaml#safeload-string---options-), except `schema`.

```javascript
const yimp = require('yaml-import');
const path = require('path');

yimp.write(path.join(__dirname, 'myfiles/base.yml'), path.join(__dirname, 'out/yaml.yml'));
```

### `yimp.read(input, options)`

Reads a *YAML* file and returns the parsed object.

- `input`: *String*, the path of the file to read.
- `options` (optional): Same as for [`yimp.write()`](#yimpwriteinput-output-options).

```javascript
const yimp = require('yaml-import');
const path = require('path');

const myYmlObj = yimp.read(path.join(__dirname, 'myfiles/base.yml'));

// We could write it later on with js-yaml and fs
const yaml = require('js-yaml');
const fs = require('fs');
// To YAML
const myYml = yaml.dump(myYmlObj);
// Write to file
fs.writeFileSync(path.join(__dirname, 'output.yml'), myYml);
```

### Flexible Usage with `js-yaml`

You can use `yaml-import` to return a `schema` and pair it with [js-yaml](https://www.npmjs.com/package/js-yaml) for a more flexible usage on use cases not contemplated by the previous api.

#### `yimp.getSchema(dir, options)`

- `dir`: *String*, the base directory to read the imported files from.
- `options` (optional): Same as for [`yimp.write()`](#yimpwriteinput-output-options). Used when files to import are loaded.

```javascript
const yaml = require('js-yaml');
const yimp = require('yaml-import');
const path = require('path');
const fs = require('fs');

const src = fs.readFileSync(path.join(__dirname, 'myfiles/base.yml'), 'utf8');
const dir = path.join(__dirname, 'myfiles')
const schema = yimp.getSchema(dir);
const myYml = yaml.safeLoad(src, { schema: schema });
```
