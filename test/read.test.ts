import fs from 'node:fs';

import { type Mock, beforeEach, expect, test, vi } from 'vitest';
import yaml from 'js-yaml';

import read from '../src/read';
import getSchema from '../src/get-schema';

vi.mock('node:fs');
vi.mock('js-yaml');
vi.mock('../src/get-schema');

const mocks: { [key: string]: Mock } = {
  getSchema,
  load: yaml.load,
  safeLoad: yaml.safeLoad,
  readFileSync: fs.readFileSync
} as any;

mocks.getSchema.mockImplementation(() => 'SCHEMA');
mocks.load.mockImplementation(() => 'LOAD');
mocks.safeLoad.mockImplementation(() => 'SAFE_LOAD');
mocks.readFileSync.mockImplementation(() => 'FILE');

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`succeeds w/ defaults`, () => {
  expect(read('foo/bar/baz.yml')).toMatchInlineSnapshot(`"SAFE_LOAD"`);

  expect(mocks.readFileSync).toHaveBeenCalledTimes(1);
  expect(mocks.getSchema).toHaveBeenCalledTimes(1);
  expect(mocks.safeLoad).toHaveBeenCalledTimes(1);
  expect(mocks.load).not.toHaveBeenCalled();

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
        "safe": true,
      },
      undefined,
    ]
  `);
  expect(mocks.safeLoad.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "FILE",
      {
        "filename": "foo/bar/baz.yml",
        "safe": true,
        "schema": "SCHEMA",
      },
    ]
  `);
});

test(`succeeds w/ safe, passes options & schemas`, () => {
  expect(
    read('foo/bar/baz.yml', { safe: false, ext: ['.yml'] }, ['foo', 'bar'])
  ).toMatchInlineSnapshot(`"LOAD"`);

  expect(mocks.readFileSync).toHaveBeenCalledTimes(1);
  expect(mocks.getSchema).toHaveBeenCalledTimes(1);
  expect(mocks.load).toHaveBeenCalledTimes(1);
  expect(mocks.safeLoad).not.toHaveBeenCalled();

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
        "ext": [
          ".yml",
        ],
        "safe": false,
      },
      [
        "foo",
        "bar",
      ],
    ]
  `);
  expect(mocks.load.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "FILE",
      {
        "ext": [
          ".yml",
        ],
        "filename": "foo/bar/baz.yml",
        "safe": false,
        "schema": "SCHEMA",
      },
    ]
  `);
});
