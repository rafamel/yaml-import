import { expect, test } from 'vitest';

import type { Payload } from '../../src/get-schema/definitions';
import { validatePayload } from '../../src/get-schema/validate-payload';

test(`returns true`, () => {
  const items: Payload[] = [
    { paths: 'foo' },
    { paths: ['foo'] },
    { paths: 'foo', strategy: 'sequence' },
    { paths: 'foo', strategy: 'shallow' },
    { paths: 'foo', strategy: 'merge' },
    { paths: 'foo', strategy: 'deep' },
    { paths: 'foo', data: 4 },
    { paths: 'foo', data: 'foo' },
    { paths: 'foo', data: {} },
    { paths: 'foo', recursive: true },
    { paths: 'foo', recursive: false }
  ];
  items.forEach((item) => expect(validatePayload(item)).toBe(true));
});
test(`returns false`, () => {
  const items: Payload[] = [
    { paths: '' },
    { paths: [] },
    { paths: [''] },
    { paths: 'foo', strategy: 'foo' as any },
    { paths: 'foo', foo: 'bar' } as any,
    { paths: 'foo', recursive: 'foo' }
  ];
  items.forEach((item) => expect(validatePayload(item)).toBe(false));
});
