import fs from 'node:fs';

import { type Mock, beforeEach, expect, test, vi } from 'vitest';
import yaml from 'js-yaml';

import { read } from '../src/read';
import { getSchema } from '../src/get-schema';

vi.mock('node:fs');
vi.mock('js-yaml');
vi.mock('../src/get-schema');

const mocks: { [key: string]: Mock } = {
  getSchema,
  load: yaml.load,
  readFileSync: fs.readFileSync
} as any;

mocks.getSchema.mockImplementation(() => 'SCHEMA');
mocks.load.mockImplementation(() => 'LOAD');
mocks.readFileSync.mockImplementation(() => 'FILE');

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`succeeds w/ defaults`, () => {
  expect(read('foo/bar/baz.yml')).toMatchInlineSnapshot(`"LOAD"`);

  expect(mocks.readFileSync).toHaveBeenCalledTimes(1);
  expect(mocks.getSchema).toHaveBeenCalledTimes(1);
  expect(mocks.load).toHaveBeenCalledTimes(1);

  expect(mocks.readFileSync.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "foo/bar/baz.yml",
      "utf8",
    ]
  `);
  expect(mocks.getSchema.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "foo/bar",
      undefined,
    ]
  `);
  expect(mocks.load.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "FILE",
      {
        "filename": "foo/bar/baz.yml",
        "schema": "SCHEMA",
      },
    ]
  `);
});

test(`succeeds w/ options & schemas`, () => {
  expect(
    read('foo/bar/baz.yml', { extensions: ['.yml'], schema: 'foo' as any })
  ).toMatchInlineSnapshot(`"LOAD"`);

  expect(mocks.readFileSync).toHaveBeenCalledTimes(1);
  expect(mocks.getSchema).toHaveBeenCalledTimes(1);
  expect(mocks.load).toHaveBeenCalledTimes(1);

  expect(mocks.readFileSync.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "foo/bar/baz.yml",
      "utf8",
    ]
  `);
  expect(mocks.getSchema.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "foo/bar",
      {
        "extensions": [
          ".yml",
        ],
        "schema": "foo",
      },
    ]
  `);
  expect(mocks.load.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "FILE",
      {
        "extensions": [
          ".yml",
        ],
        "filename": "foo/bar/baz.yml",
        "schema": "SCHEMA",
      },
    ]
  `);
});
