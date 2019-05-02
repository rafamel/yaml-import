/* eslint-disable no-console */
import pkg from '../../package.json';
import main from '~/bin/main';
import read from '~/read';
import write from '~/write';
import yaml from 'js-yaml';

jest.mock('~/read');
jest.mock('~/write');
jest.mock('js-yaml');
console.log = jest.fn();

const mocks: { [key: string]: jest.Mock } = {
  read,
  write,
  dump: yaml.dump,
  console: console.log
} as any;

process.cwd = () => '/foo/bar';
mocks.read.mockImplementation(() => ' READ ');
mocks.dump.mockImplementation(() => 'DUMP');

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`Shows help`, async () => {
  await expect(main(['--help'])).resolves.toBeUndefined();
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.write).not.toHaveBeenCalled();
  expect(mocks.console).toHaveBeenCalledTimes(1);
  expect(mocks.console.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "Import files and directories in YAML for a modular design
    
    Usage:
      $ yimp [options]
    
    Options:
      -i, --input <path>        Path to input file
      -o, --output <path>       Path to output file, optional
      -e, --ext <extensions>    Extensions, comma separated, optional
      -h, --help                Show help
      -v, --version             Show version number",
    ]
  `);
});
test(`Shows version`, async () => {
  await expect(main(['--version'])).resolves.toBeUndefined();
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.write).not.toHaveBeenCalled();
  expect(mocks.console).toHaveBeenCalledTimes(1);
  expect(mocks.console.mock.calls[0]).toEqual([pkg.version]);
});
test(`Fails for unknown commands`, async () => {
  await expect(main(['foo'])).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unexpected command: foo"`
  );
});
test(`Fails for unknown flags`, async () => {
  await expect(main(['--foo'])).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unknown or unexpected option: --foo"`
  );
});
test(`Fails wo/ --input`, async () => {
  await expect(main([])).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Input file path is required"`
  );
});
test(`Succeeds w/ --input`, async () => {
  await expect(main('--input foo/bar'.split(' '))).resolves.toBeUndefined();
  expect(mocks.write).not.toHaveBeenCalled();
  expect(mocks.read).toHaveBeenCalledTimes(1);
  expect(mocks.dump).toHaveBeenCalledTimes(1);
  expect(mocks.console).toHaveBeenCalledTimes(1);
  expect(mocks.read.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "/foo/bar/foo/bar",
      Object {},
    ]
  `);
  expect(mocks.dump.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      " READ ",
    ]
  `);
  expect(mocks.console.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "DUMP",
    ]
  `);
});
test(`Succeeds w/ absolute paths, --input --ext`, async () => {
  await expect(
    main('--input /foo/bar --ext yml,yaml,.yaml,.yml'.split(' '))
  ).resolves.toBeUndefined();
  expect(mocks.write).not.toHaveBeenCalled();
  expect(mocks.read).toHaveBeenCalledTimes(1);
  expect(mocks.dump).toHaveBeenCalledTimes(1);
  expect(mocks.console).toHaveBeenCalledTimes(1);
  expect(mocks.read.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "/foo/bar",
      Object {
        "ext": Array [
          ".yml",
          ".yaml",
          ".yaml",
          ".yml",
        ],
      },
    ]
  `);
  expect(mocks.dump.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      " READ ",
    ]
  `);
  expect(mocks.console.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "DUMP",
    ]
  `);
});
test(`Succeeds w/ --input --output`, async () => {
  await expect(
    main('--input foo/bar --output bar/baz'.split(' '))
  ).resolves.toBeUndefined();
  expect(mocks.write).toHaveBeenCalledTimes(1);
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.dump).not.toHaveBeenCalled();
  expect(mocks.console).not.toHaveBeenCalled();
  expect(mocks.write.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "/foo/bar/foo/bar",
      "/foo/bar/bar/baz",
      Object {},
    ]
  `);
});
test(`Succeeds w/ absolute paths, --input --output --ext`, async () => {
  await expect(
    main('--input /foo/bar --output /bar/baz --ext .yml,yaml'.split(' '))
  ).resolves.toBeUndefined();
  expect(mocks.write).toHaveBeenCalledTimes(1);
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.dump).not.toHaveBeenCalled();
  expect(mocks.console).not.toHaveBeenCalled();
  expect(mocks.write.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "/foo/bar",
      "/bar/baz",
      Object {
        "ext": Array [
          ".yml",
          ".yaml",
        ],
      },
    ]
  `);
});
