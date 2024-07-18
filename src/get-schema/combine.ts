import { deep, merge, shallow } from 'merge-strategies';

import { defaults } from '../defaults';
import type { Strategy } from './definitions';

const strategies = { shallow, merge, deep };
export function combine(data: any[], strategy?: Strategy): any {
  if (strategy === 'sequence') return data.concat();
  const fn = strategies[strategy || defaults.strategy];

  if (!fn) throw new Error(`Strategy ${strategy} is not valid`);
  if (!data.length) return;

  let ans: any = data[0];
  for (let i = 1; i < data.length; i++) {
    ans = fn(ans, data[i]);
  }
  return ans;
}
