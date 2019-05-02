import read from '~/read';
import getSchema from '~/get-schema';
import yaml from 'js-yaml';
import fs from 'fs';

jest.mock('~/get-schema');
jest.mock('js-yaml');
jest.mock('fs');

const mocks: { [key: string]: jest.Mock } = {
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
                                Array [
                                  "foo/bar/baz.yml",
                                  "utf8",
                                ]
                `);
  expect(mocks.getSchema.mock.calls[0]).toMatchInlineSnapshot(`
            Array [
              "foo/bar",
              Object {
                "safe": true,
              },
              undefined,
            ]
      `);
  expect(mocks.safeLoad.mock.calls[0]).toMatchInlineSnapshot(`
                            Array [
                              "FILE",
                              Object {
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
                                Array [
                                  "foo/bar/baz.yml",
                                  "utf8",
                                ]
                `);
  expect(mocks.getSchema.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "foo/bar",
      Object {
        "ext": Array [
          ".yml",
        ],
        "safe": false,
      },
      Array [
        "foo",
        "bar",
      ],
    ]
  `);
  expect(mocks.load.mock.calls[0]).toMatchInlineSnapshot(`
        Array [
          "FILE",
          Object {
            "ext": Array [
              ".yml",
            ],
            "filename": "foo/bar/baz.yml",
            "safe": false,
            "schema": "SCHEMA",
          },
        ]
    `);
});
