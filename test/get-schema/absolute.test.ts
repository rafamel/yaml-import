import absolute from '~/get-schema/absolute';

test(`returns relative`, () => {
  expect(absolute({ cwd: '/foo', file: 'bar.yml' })).toBe('/foo/bar.yml');
  expect(absolute({ cwd: '/foo', file: './bar.yml' })).toBe('/foo/bar.yml');
});

test(`returns absolute`, () => {
  expect(absolute({ cwd: '/foo', file: '/bar.yml' })).toBe('/bar.yml');
});
