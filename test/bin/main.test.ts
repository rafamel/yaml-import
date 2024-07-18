import { type Mock, beforeEach, expect, test, vi } from 'vitest';
import yaml from 'js-yaml';

import { main } from '../../src/bin/main';
import { read } from '../../src/read';
import { write } from '../../src/write';
import pkg from '../../package.json';

vi.mock('js-yaml');
vi.mock('../../src/read');
vi.mock('../../src/write');

const noop = () => null;
const mocks: { [key: string]: Mock } = {
  read,
  write,
  dump: yaml.dump
} as any;

process.cwd = () => '/foo/bar';
mocks.read.mockImplementation(() => ' READ ');
mocks.dump.mockImplementation(() => 'DUMP');

beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockClear()));

test(`Shows help`, async () => {
  const fn = vi.fn();
  await expect(main(['--help'], fn)).resolves.toBeUndefined();
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.write).not.toHaveBeenCalled();
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "Import files and directories in YAML for a modular design

    Usage:
      $ yimp file [options]

    Options:
      -o, --output <path>       Path to output file, optional
      -e, --ext <extensions>    Extensions, comma separated, optional
      -h, --help                Show help
      -v, --version             Show version number

    Example:
      $ yimp source.yml -o destination.yml -e yml,yaml,raml",
    ]
  `);
});
test(`Shows version`, async () => {
  const fn = vi.fn();
  await expect(main(['--version'], fn)).resolves.toBeUndefined();
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.write).not.toHaveBeenCalled();
  expect(fn).toHaveBeenCalledTimes(1);
  expect(fn.mock.calls[0]).toEqual([pkg.version]);
});
test(`Fails for unknown flags`, async () => {
  await expect(
    main(['--foo'], noop)
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[ArgError: unknown or unexpected option: --foo]`
  );
});
test(`Fails wo/ source file`, async () => {
  await expect(main([], noop)).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: A source file is required]`
  );
});
test(`Fails w/ extra source files`, async () => {
  await expect(
    main(['foo', 'bar'], noop)
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `[Error: No more than once source file is allowed]`
  );
});
test(`Succeeds w/ source file`, async () => {
  const fn = vi.fn();
  await expect(main('foo/bar'.split(' '), fn)).resolves.toBeUndefined();
  expect(mocks.write).not.toHaveBeenCalled();
  expect(mocks.read).toHaveBeenCalledTimes(1);
  expect(mocks.dump).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(mocks.read.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "/foo/bar/foo/bar",
      {},
    ]
  `);
  expect(mocks.dump.mock.calls[0]).toMatchInlineSnapshot(`
    [
      " READ ",
    ]
  `);
  expect(fn.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "DUMP",
    ]
  `);
});
test(`Succeeds w/ absolute paths, source file, --ext`, async () => {
  const fn = vi.fn();
  await expect(
    main('/foo/bar --ext yml,yaml,.yaml,.yml'.split(' '), fn)
  ).resolves.toBeUndefined();
  expect(mocks.write).not.toHaveBeenCalled();
  expect(mocks.read).toHaveBeenCalledTimes(1);
  expect(mocks.dump).toHaveBeenCalledTimes(1);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(mocks.read.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "/foo/bar",
      {
        "extensions": [
          ".yml",
          ".yaml",
          ".yaml",
          ".yml",
        ],
      },
    ]
  `);
  expect(mocks.dump.mock.calls[0]).toMatchInlineSnapshot(`
    [
      " READ ",
    ]
  `);
  expect(fn.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "DUMP",
    ]
  `);
});
test(`Succeeds w/ source file, --output`, async () => {
  const fn = vi.fn();
  await expect(
    main('foo/bar --output bar/baz'.split(' '), fn)
  ).resolves.toBeUndefined();
  expect(mocks.write).toHaveBeenCalledTimes(1);
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.dump).not.toHaveBeenCalled();
  expect(fn).not.toHaveBeenCalled();
  expect(mocks.write.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "/foo/bar/foo/bar",
      "/foo/bar/bar/baz",
      {},
    ]
  `);
});
test(`Succeeds w/ absolute paths, source file, --output, --ext`, async () => {
  const fn = vi.fn();
  await expect(
    main('/foo/bar --output /bar/baz --ext .yml,yaml'.split(' '), fn)
  ).resolves.toBeUndefined();
  expect(mocks.write).toHaveBeenCalledTimes(1);
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.dump).not.toHaveBeenCalled();
  expect(fn).not.toHaveBeenCalled();
  expect(mocks.write.mock.calls[0]).toMatchInlineSnapshot(`
    [
      "/foo/bar",
      "/bar/baz",
      {
        "extensions": [
          ".yml",
          ".yaml",
        ],
      },
    ]
  `);
});
