import write from '~/write';
import read from '~/read';
import yaml from 'js-yaml';
import fs from 'fs';

jest.mock('~/read');
jest.mock('js-yaml');
jest.mock('fs');

const mocks: { [key: string]: jest.Mock } = {
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
        Array [
          "foo/bar/baz.yml",
          undefined,
          undefined,
        ]
    `);
  expect(mocks.dump.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
          "READ",
        ]
    `);
  expect(mocks.writeFileSync.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
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
    Array [
      "foo/bar/baz.yml",
      Object {
        "safe": true,
      },
      Array [
        "foo",
        "bar",
      ],
    ]
  `);
  expect(mocks.dump.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
          "READ",
        ]
    `);
  expect(mocks.writeFileSync.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
          "foo/bar/foobar.yml",
          "DUMP",
        ]
    `);
});
