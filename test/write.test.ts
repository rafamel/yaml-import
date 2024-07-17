import fs from 'node:fs';

import { type Mock, beforeEach, expect, test, vi } from 'vitest';
import yaml from 'js-yaml';

import write from '../src/write';
import read from '../src/read';

vi.mock('node:fs');
vi.mock('js-yaml');
vi.mock('../src/read');

const mocks: { [key: string]: Mock } = {
  read,
  dump: yaml.dump,
  writeFileSync: fs.writeFileSync
} as any;

mocks.read.mockImplementation(() => 'READ');
mocks.dump.mockImplementation(() => 'DUMP');
mocks.writeFileSync.mockImplementation(() => 'WRITE');

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`succeeds w/ defaults`, () => {
  expect(write('foo/bar/baz.yml', 'foo/bar/foobar.yml')).toBeUndefined();
  expect(mocks.read).toHaveBeenCalledTimes(1);
  expect(mocks.dump).toHaveBeenCalledTimes(1);
  expect(mocks.writeFileSync).toHaveBeenCalledTimes(1);
  expect(mocks.read.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "foo/bar/baz.yml",
      undefined,
      undefined,
    ]
  `);
  expect(mocks.dump.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "READ",
    ]
  `);
  expect(mocks.writeFileSync.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "foo/bar/foobar.yml",
      "DUMP",
    ]
  `);
});
test(`succeeds; passes options & schemas`, () => {
  expect(
    write('foo/bar/baz.yml', 'foo/bar/foobar.yml', { safe: true }, [
      'foo',
      'bar'
    ])
  ).toBeUndefined();
  expect(mocks.read).toHaveBeenCalledTimes(1);
  expect(mocks.dump).toHaveBeenCalledTimes(1);
  expect(mocks.writeFileSync).toHaveBeenCalledTimes(1);
  expect(mocks.read.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "foo/bar/baz.yml",
      {
        "safe": true,
      },
      [
        "foo",
        "bar",
      ],
    ]
  `);
  expect(mocks.dump.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "READ",
    ]
  `);
  expect(mocks.writeFileSync.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "foo/bar/foobar.yml",
      "DUMP",
    ]
  `);
});
