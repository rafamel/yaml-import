# yaml-import

[![Version](https://img.shields.io/npm/v/yaml-import.svg)](https://www.npmjs.com/package/yaml-import)
[![Types](https://img.shields.io/npm/types/yaml-import.svg)](https://www.npmjs.com/package/yaml-import)
[![License](https://img.shields.io/github/license/rafamel/yaml-import.svg)](https://github.com/rafamel/yaml-import/blob/master/LICENSE)

> Import files and directories in *YAML* for a modular design

## Install

* Local install for programmatic usage: `npm install yaml-import`.
* Global install, so the `yimp` executable is globally available: `npm install -g yaml-import`.

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

```
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

If there is no `output` file, the contents will be written to `stdout`. The list of `ext` -file extensions for directory imports, see [`write`](#writesource-destination-options)- must be comma separated, without spaces.

```
Usage:
  $ yimp file [options]

Options:
  -o, --output <path>       Path to output file, optional
  -e, --ext <extensions>    Extensions, comma separated, optional
  -h, --help                Show help
  -v, --version             Show version number

Example:
  $ yimp source.yml -o destination.yml -e yml,yaml,raml
```

### Programatic Usage

#### `write(source, destination, options?)`

Reads a *YAML* file and writes the output on a file.

* `source`: **Required,** *string.* Path of the file to read.
* `destination`: **Required,** *string*. Path for the output file.
* `options` **Optional,** *object:*
  * `extensions`: **Optional,** *string[].* List of extensions to use for directory imports. Default: `['.yml', '.yaml']`.
  * [All other options taken by *js-yaml*](https://github.com/nodeca/js-yaml/blob/master/README.md#load-string---options-), except `schema`.

```javascript
import path from 'node:path';

import { write } from 'yaml-import';

write(
  path.join(import.meta.dirname, 'foo/root.yml'),
  path.join(import.meta.dirname, 'out/yaml.yml')
);
```

#### `read(source, options?)`

Reads a *YAML* file and returns the parsed object.

* `input`: **Required,** *string.* Path of the file to read.
* `options`: **Optional,** *object.* Same as those taken by [`write`](#writesource-destination-options).

```javascript
import path from 'node:path';

import { read } from 'yaml-import';

const content = read(path.join(import.meta.dirname, 'foo/root.yml'));
```

We could write it later on with `js-yaml` and `fs`:

```javascript
import fs from 'node:fs';

import { dump } from 'js-yaml';

// To YAML
const text = dump(content);
// Write to file
fs.writeFileSync(path.join(import.meta.dirname, 'out/yaml.yml'), text);
```

### `getSchema(cwd, options?)`

For flexible usage with *js-yaml,* `getSchema` returns a `schema` you can pass to [*js-yaml*](https://www.npmjs.com/package/js-yaml) functions.

* `cwd`: **Required,** *string.* Base directory to read imported files from.
* `options`: **Optional,** *object.* Same as those taken by [`write`](#writesource-destination-options). Used when files to import are loaded.

```javascript
import path from 'node:path';
import fs from 'node:fs';

import { load } from 'js-yaml';
import { getSchema } from 'yaml-import';

const src = fs.readFileSync(path.join(import.meta.dirname, 'foo/root.yml'), 'utf8');
const cwd = path.join(import.meta.dirname, 'foo');
const schema = getSchema(cwd);
const content = load(src, { schema });
```
