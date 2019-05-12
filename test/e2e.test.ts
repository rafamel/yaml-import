import path from 'path';
import read from '~/read';
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
