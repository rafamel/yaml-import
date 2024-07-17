import path from 'node:path';

import { expect, test } from 'vitest';

import read from '../src/read';
import json from './fixtures/result.json';

const root = path.join(__dirname, 'fixtures/root.yml');

test(`wo/ extensions`, () => {
  const result = read(root);
  expect(result).toEqual(json);
});

test(`w/ extensions`, () => {
  const result = read(root, { ext: ['.yml', '.raml'] });
  expect(result).toEqual({ ...json, extensions: ['raml', 5, 'foo'] });
});
