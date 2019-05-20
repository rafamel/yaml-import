# yaml-import

[![Version](https://img.shields.io/npm/v/yaml-import.svg)](https://www.npmjs.com/package/yaml-import)
[![Build Status](https://img.shields.io/travis/rafamel/yaml-import/master.svg)](https://travis-ci.org/rafamel/yaml-import)
[![Coverage](https://img.shields.io/coveralls/rafamel/yaml-import/master.svg)](https://coveralls.io/github/rafamel/yaml-import)
[![Dependencies](https://img.shields.io/david/rafamel/yaml-import.svg)](https://david-dm.org/rafamel/yaml-import)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/yaml-import.svg)](https://snyk.io/test/npm/yaml-import)
[![License](https://img.shields.io/github/license/rafamel/yaml-import.svg)](https://github.com/rafamel/yaml-import/blob/master/LICENSE)
[![Types](https://img.shields.io/npm/types/yaml-import.svg)](https://www.npmjs.com/package/yaml-import)

> Import files and directories in *YAML* for a modular design

If you find it useful, consider [starring the project](https://github.com/rafamel/yaml-import) 💪 and/or following [its author](https://github.com/rafamel) ❤️ -there's more on the way!

## Install

* Global install -the `yimp` executable will be globally available: `npm install -g yaml-import`.
* Local install -for programmatic usage: `npm install yaml-import`.

## *YAML*

With `yaml-import`, the imports are relative to the current *YAML* file. For further insight on how each import type behaves, you can check the [integration tests root *yaml* file](https://github.com/rafamel/yaml-import/blob/master/test/fixtures/root.yml) and its [expected result.](https://github.com/rafamel/yaml-import/blob/master/test/fixtures/result.json)

### `!!import/single` *string*

Imports the contents of a single file

```yaml
foo: !!import/single foo/bar.yml
bar:
  - item
  - !!import/single bar/baz.yml
```

### `!!import/sequence` *string[]*

Resolves with an array of the contents of all files passed. If a directory is passed, it will include all files on that directory.

```yaml
!!import/sequence
  - foo/foo.yml
  - foo/bar.yml
  - baz/
```

### `!!import/shallow` *string[]*

Resolves with a shallow merge of the contents of all files passed. If a directory is passed, it will include all files on that directory. If a value is not an object, it will overwrite all previous values for that field.

```yaml
!!import/shallow
  - foo/foo.yml
  - foo/bar.yml
  - baz/
```

### `!!import/merge` *string[]*

Resolves with a deep merge of the contents of all files passed, excluding arrays -which will be overwritten. If a directory is passed, it will include all files on that directory. If a value is not an object, it will overwrite all previous values for that field.

```yaml
!!import/merge
  - foo/foo.yml
  - foo/bar.yml
  - baz/
```

### `!!import/deep` *string[]*

Resolves with a deep merge of the contents of all files passed, including arrays -which will be concatenated. If a directory is passed, it will include all files on that directory. If a value is not an object, it will overwrite all previous values for that field.

```yaml
!!import/deep
  - foo/foo.yml
  - foo/bar.yml
  - baz/
```

### `!!import/payload` *object*

Takes in an object with fields:

* `paths`: **Required,** *string | string[].* Paths to import -files or directories.
* `strategy`: **Optional,** *string.* Any of `'sequence'`, `'shallow'`, `'merge'`, and `'deep'`. Default: `'merge'`.
* `data`: **Optional.** Any additional data to be treated as coming from an additional last element of `paths` -that is, the content of `paths` will be merged with `data` with the chosen `strategy`.
* `recursive`: **Optional,** *boolean.* Whether to recursively traverse directories when passed as `paths`. Default: `false`.

```yaml
# These would be equivalent:
!!import/merge
  - foo/foo.yml
!!import/payload
  paths: foo/foo.yml

# And these would too:
!!import/deep
  - foo/foo.yml
  - foo/bar.yml
!!import/payload
  strategy: deep
  paths:
    - foo/foo.yml
    - foo/bar.yml
```

### `!!import/tree` *object*

Creates an object with keys equivalent to the directory tree and files from each path in `paths`, then merges all of them with `strategy`.

Takes in an object with fields:

* `paths`: **Required,** *string | string[].* Paths to import -files or directories.
* `strategy`: **Optional,** *string.* Any of `'sequence'`, `'shallow'`, `'merge'`, and `'deep'`. Default: `'merge'`.
* `data`: **Optional.** Any additional data to be treated as coming from an additional last element of `paths` -that is, the content of `paths` will be merged with `data` with the chosen `strategy`.
* `recursive`: **Optional,** *boolean.* Whether to recursively traverse directories when passed as `paths`. Default: `false`.

```yaml
# If we had the following tree, it would resolve with an object with keys 'a'
# and 'b', while the contents of 'a' would be merged with a 'deep' strategy:
#   foo
#     a.yml
#     b.yml
#   bar
#     a.yml
!!import/tree
  strategy: deep
  paths:
    - foo/
    - bar/
```

## Usage

### Command Line

If there is no `output` file, the contents will be written to `stdout`. The list of `ext` -file extensions for directory imports, see [`write`](#writeinput-output-options-schemas)- must be comma separated, without spaces.

```
Usage:
  $ yimp [options]

Options:
  -i, --input <path>        Path to input file
  -o, --output <path>       Path to output file, optional
  -e, --ext <extensions>    Extensions, comma separated, optional
  -h, --help                Show help
  -v, --version             Show version number

Example:
  $ yimp -i input-file.yml -o output-file.yml -e yml,yaml,raml
```

### Programatic Usage

#### `write(input, output, options?, schemas?)`

Reads a *YAML* file and writes the output on a file.

* `input`: **Required,** *string.* Path of the file to read.
* `output`: **Required,** *string*. Path for the output file.
* `options` **Optional,** *object:*
  * `ext`: **Optional,** *string[].* List of extensions to use for directory imports. Default: `['.yml', '.yaml']`.
  * `safe`: **Optional,** *boolean*. Whether to use `safeLoad` or `load` when loading *YAML* files via [*js-yaml*](https://www.npmjs.com/package/js-yaml). Default: `true`.
  * [All other options taken by *js-yaml*](https://github.com/nodeca/js-yaml#safeload-string---options-), except `schema`.
* `schemas`: **Optional,** *array.* *YAML* schemas to extend.

```javascript
import path from 'path';
import { write } from 'yaml-import';

write(
  path.join(__dirname, 'foo/root.yml'),
  path.join(__dirname, 'out/yaml.yml')
);
```

#### `read(input, options?, schemas?)`

Reads a *YAML* file and returns the parsed object.

* `input`: **Required,** *string.* Path of the file to read.
* `options`: **Optional,** *object.* Same as those taken by [`write`](#writeinput-output-options-schemas).
* `schemas`: **Optional,** *array.* *YAML* schemas to extend.

```javascript
import path from 'path';
import { read } from 'yaml-import';

const content = read(path.join(__dirname, 'foo/root.yml'));
```

We could write it later on with `js-yaml` and `fs`:

```javascript
import yaml from 'js-yaml';
import fs from 'fs';

// To YAML
const text = yaml.dump(content);
// Write to file
fs.writeFileSync(path.join(__dirname, 'out/yaml.yml'), text);
```

### `getSchema(cwd, options?, schemas?)`

For flexible usage with *js-yaml,* `getSchema` returns a `schema` you can pass to [*js-yaml*](https://www.npmjs.com/package/js-yaml) functions.

* `cwd`: **Required,** *string.* Base directory to read imported files from.
* `options`: **Optional,** *object.* Same as those taken by [`write`](#writeinput-output-options-schemas). Used when files to import are loaded.
* `schemas`: **Optional,** *array.* *YAML* schemas to extend.

```javascript
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { getSchema } from 'yaml-import';

const src = fs.readFileSync(path.join(__dirname, 'foo/root.yml'), 'utf8');
const cwd = path.join(__dirname, 'foo');
const schema = getSchema(cwd);
const content = yaml.safeLoad(src, { schema: schema });
```
