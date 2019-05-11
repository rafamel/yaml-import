import path from 'path';
import read from '~/read';
import json from './fixtures/result.json';

test(`e2e`, () => {
  const result = read(path.join(__dirname, 'fixtures/root.yml'));
  expect(result).toEqual(json);
});
