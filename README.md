# yaml-import

[![Version](https://img.shields.io/npm/v/yaml-import.svg)](https://www.npmjs.com/package/yaml-import)
[![Build Status](https://travis-ci.org/rafamel/yaml-import.svg)](https://travis-ci.org/rafamel/yaml-import)
[![Coverage](https://img.shields.io/coveralls/rafamel/yaml-import.svg)](https://coveralls.io/github/rafamel/yaml-import)
[![Dependencies](https://david-dm.org/rafamel/yaml-import/status.svg)](https://david-dm.org/rafamel/yaml-import)
[![Vulnerabilities](https://snyk.io/test/npm/yaml-import/badge.svg)](https://snyk.io/test/npm/yaml-import)
[![Issues](https://img.shields.io/github/issues/rafamel/yaml-import.svg)](https://github.com/rafamel/yaml-import/issues)
[![License](https://img.shields.io/github/license/rafamel/yaml-import.svg)](https://github.com/rafamel/yaml-import/blob/master/LICENSE)

**Import files and directories in *YAML* for a modular design.**

## Install

[`npm install yaml-import`](https://www.npmjs.com/package/yaml-import)

## *YAML*

With `yaml-import`, the imports are relative to the current *YAML* file.

### `!!import/single` *file*

Imports the contents of a single file

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

Merges the contents of numerous files into one object or array.

- If all the files are objects, it will merge all the keys into one single object.
- If one or more of the files contain any other type, it will concatenate an array (so if any of the files is an array itself, all its elements will go into the top level).

```yaml
!!import/merge [
  'mydir/file-one.yml',
  'mydir/file-two.yml',
  'myotherdir/file-three.yml',
]
```

### `!!import/dirMerge` *dir*

Same as [`!!import/merge`](#importmerge-array), but with all the files (recursively) within a directory.

```yaml
!!import/dirMerge myNice/dir
```

### `!!import/dirSeq` *dir*

It will create a `sequence` (array), and the contents of each of the files found within the directory (recursively) will be an element of the array.

```yaml
!!import/dirSeq myNice/dir
```

### `!!import/dirMap` *dir*

It will create a `mapping` (object) with keys equivalent to the directory tree and files (nested).

```yaml
!!import/dirMap myNice/dir
```

## Usage

### Command Line

#### `yimp -i input -o output`

If there is not an `output` file, the contents will be written to `stdout`. The list of `ext` (file extensions for directory imports, read more on [`yimp.write()`](#yimpwriteinput-output-options)) must be comma separated, without spaces or dots.

```bash
Options:
  -i, --input   Path to input file
  -o, --output  Path to output file (optional)
  -e, --ext     Extension array (comma separated, optional)
  --version     Show version number
  --help        Show help
```

#### Example

```bash
yimp -i my-input-file.yml -o my-output-file.yml -e yml,yaml,raml
```

### Simple Programatic Usage

#### `yimp.write(input, output, options)`

Reads a *YAML* file and writes the output on a file.

- `input`: *String*, the path of the file to read.
- `output`: *String*, the path for the output file.
- `options` (optional): *Object*
  - `ext`: *Array*, list of extensions to use for directory imports. By default, `['.yml', '.yaml']`.
  - `safe`: *Boolean*, whether it should use `safeLoad` or `load` when loading the *YAML* file via [js-yaml](https://www.npmjs.com/package/js-yaml). `true` by default.
  - [All others offered by js-yaml](https://github.com/nodeca/js-yaml#safeload-string---options-), except `schema`.

```javascript
import path from 'path';
import * as yimp from 'yaml-import';

yimp.write(
  path.join(__dirname, 'myfiles/base.yml'),
  path.join(__dirname, 'out/yaml.yml')
);
```

#### `yimp.read(input, options)`

Reads a *YAML* file and returns the parsed object.

- `input`: *String*, the path of the file to read.
- `options` (optional): Same as [`yimp.write()`](#yimpwriteinput-output-options).

```javascript
import path from 'path';
import * as yimp from 'yaml-import';

const myYmlObj = yimp.read(path.join(__dirname, 'myfiles/base.yml'));
```

We could write it later on with js-yaml and fs:

```javascript
import yaml from 'js-yaml';
import fs from 'fs';

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
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import * as yimp from 'yaml-import';

const src = fs.readFileSync(path.join(__dirname, 'myfiles/base.yml'), 'utf8');
const dir = path.join(__dirname, 'myfiles')
const schema = yimp.getSchema(dir);
const myYml = yaml.safeLoad(src, { schema: schema });
```
