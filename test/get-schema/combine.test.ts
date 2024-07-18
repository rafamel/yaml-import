import { expect, test } from 'vitest';

import { combine } from '../../src/get-schema/combine';

test(`errors out on invalid strategy`, () => {
  expect(() => {
    combine([{}], 'invalid' as any);
  }).toThrowErrorMatchingInlineSnapshot(
    `[Error: Strategy invalid is not valid]`
  );
});
test(`returns data for sequence`, () => {
  expect(combine(['foo', 'bar'], 'sequence')).toEqual(['foo', 'bar']);
  expect(combine([], 'sequence')).toEqual([]);
});
test(`doesn't return the same object for sequence`, () => {
  const arr = ['foo', 'bar'];
  expect(combine(arr, 'sequence')).not.toBe(arr);
});
test(`returns undefined wo/ data for shallow, merge, deep`, () => {
  expect(combine([], 'shallow')).toBeUndefined();
  expect(combine([], 'merge')).toBeUndefined();
  expect(combine([], 'deep')).toBeUndefined();
});
test(`shallow`, () => {
  expect(combine([{}, 'foo'], 'shallow')).toBe('foo');
  expect(
    combine(
      [
        { foo: { bar: ['baz'], baz: 'bar' }, bar: 'baz' },
        { baz: 'bar' },
        { foo: { bar: ['foobar'] } }
      ],
      'shallow'
    )
  ).toEqual({ foo: { bar: ['foobar'] }, bar: 'baz', baz: 'bar' });
});
test(`merge; merge is default`, () => {
  ['merge' as const, undefined].forEach((strategy) => {
    expect(combine([{}, 'foo'], strategy)).toBe('foo');
    expect(
      combine(
        [
          { foo: { bar: ['baz'], baz: 'bar' }, bar: 'baz' },
          { baz: 'bar' },
          { foo: { bar: ['foobar'] } }
        ],
        strategy
      )
    ).toEqual({ foo: { bar: ['foobar'], baz: 'bar' }, bar: 'baz', baz: 'bar' });
  });
});
test(`deep`, () => {
  expect(combine([{}, 'foo'], 'deep')).toBe('foo');
  expect(
    combine(
      [
        { foo: { bar: ['baz'], baz: 'bar' }, bar: 'baz' },
        { baz: 'bar' },
        { foo: { bar: ['foobar'] } }
      ],
      'deep'
    )
  ).toEqual({
    foo: { bar: ['baz', 'foobar'], baz: 'bar' },
    bar: 'baz',
    baz: 'bar'
  });
});
