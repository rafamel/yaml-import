import merge from '~/get-schema/merge';

test(`errors out on invalid strategy`, () => {
  expect(() =>
    merge([{}], 'invalid' as any)
  ).toThrowErrorMatchingInlineSnapshot(`"Strategy invalid is not valid"`);
});
test(`returns data for sequence`, () => {
  expect(merge(['foo', 'bar'], 'sequence')).toEqual(['foo', 'bar']);
  expect(merge([], 'sequence')).toEqual([]);
});
test(`doesn't return the same object for sequence`, () => {
  const arr = ['foo', 'bar'];
  expect(merge(arr, 'sequence')).not.toBe(arr);
});
test(`returns undefined wo/ data for shallow, merge, deep`, () => {
  expect(merge([], 'shallow')).toBeUndefined();
  expect(merge([], 'merge')).toBeUndefined();
  expect(merge([], 'deep')).toBeUndefined();
});
test(`shallow`, () => {
  expect(merge([{}, 'foo'], 'shallow')).toBe('foo');
  expect(
    merge(
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
  ['merge' as 'merge', undefined].forEach((strategy) => {
    expect(merge([{}, 'foo'], strategy)).toBe('foo');
    expect(
      merge(
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
  expect(merge([{}, 'foo'], 'deep')).toBe('foo');
  expect(
    merge(
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
