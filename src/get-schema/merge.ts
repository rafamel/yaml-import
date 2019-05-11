import { TStrategy } from '~/types';
import { shallow, merge as _merge, deep } from 'merge-strategies';
import { DEFAULT_STRATEGY } from '~/constants';

const strategies = {
  shallow,
  merge: _merge,
  deep
};

export default function merge(
  data: any[],
  strategy: TStrategy = DEFAULT_STRATEGY
): any {
  if (strategy === 'sequence') return data;
  const fn = strategies[strategy];

  if (!fn) throw Error(`Strategy ${strategy} is not valid`);
  if (!data.length) return;

  let ans: any = data[0];
  for (let i = 1; i < data.length; i++) {
    ans = fn(ans, data[i]);
  }
  return ans;
}
