import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import getSchema from '~/get-schema';
import { IOpts } from '~/types';

const content = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'yml/content.json'), 'utf8')
);
function read(src: string, options: IOpts = {}): any {
  options.schema = getSchema(path.join(__dirname, 'yml'), options);
  return yaml.safeLoad(src, options);
}

describe(`import/single`, () => {
  describe(`Number`, () => {
    test(`As unquoted string`, () => {
      const src = `paths: !!import/single simples/scalar/num.yml`;
      expect(read(src)).toEqual({
        paths: content.simples.scalar.num
      });
    });
    test(`As quoted string`, () => {
      const src = `paths: !!import/single "simples/scalar/num.yml"`;
      expect(read(src)).toEqual({
        paths: content.simples.scalar.num
      });
    });
  });
  describe(`String`, () => {
    test(`Basic`, () => {
      const src = `paths: !!import/single simples/scalar/string.yml`;
      expect(read(src)).toEqual({
        paths: content.simples.scalar.string
      });
    });
  });
  describe(`Mapping`, () => {
    test(`Basic`, () => {
      const src = `paths: !!import/single simples/map/1.yml`;
      expect(read(src)).toEqual({
        paths: content.simples.map.one
      });
    });
    test(`From root`, () => {
      const src = `!!import/single simples/map/1.yml`;
      expect(read(src)).toEqual(content.simples.map.one);
    });
  });
  describe(`Sequence`, () => {
    test(`Basic`, () => {
      const src = `paths: !!import/single simples/seq/1.yml`;
      expect(read(src)).toEqual({
        paths: content.simples.seq.one
      });
    });
    test(`From root`, () => {
      const src = `!!import/single simples/seq/1.yml`;
      expect(read(src)).toEqual(content.simples.seq.one);
    });
    test(`Nested (one level)`, () => {
      const src = `!!import/single nested/one-level.yml`;
      expect(read(src)).toEqual(content.nested.oneLevel);
    });
    test(`Nested (two levels)`, () => {
      const src = `!!import/single nested/two-levels.yml`;
      expect(read(src)).toEqual(content.nested.twoLevels);
    });
  });
});

describe(`import/merge`, () => {
  test(`Mapping`, () => {
    const src = `!!import/merge [
            'simples/map/1.yml',
            'simples/map/2.yml',
            'simples/map/3.yml'
        ]`;
    expect(read(src)).toEqual(content.simples.merged.map);
  });
  test(`Sequence`, () => {
    const src = `!!import/merge [
            'simples/seq/1.yml',
            'simples/seq/2.yml',
            'simples/seq/3.yml'
        ]`;
    expect(read(src)).toEqual(content.simples.merged.seq);
  });
  test(`Nested (two levels)`, () => {
    const src = `!!import/single nested/two-levels-merge.yml`;
    expect(read(src)).toEqual(content.nested.twoLevelsMerge);
  });
  test(`Merges array for different types`, () => {
    const src = `!!import/merge [
            'simples/seq/1.yml',
            'simples/map/1.yml'
        ]`;
    let expected = content.simples.seq.one.concat();
    expected.push(content.simples.map.one);
    expect(read(src)).toEqual(expected);
  });
  test(`Merges array for different types`, () => {
    const src = `!!import/merge [
            'simples/map/1.yml',
            'simples/seq/1.yml'
        ]`;
    let expected = content.simples.seq.one.concat();
    expected.unshift(content.simples.map.one);
    expect(read(src)).toEqual(expected);
  });
});

describe(`import/dirMerge`, () => {
  test(`Mapping`, () => {
    const src = `!!import/dirMerge simples/map`;
    expect(read(src)).toEqual(content.simples.merged.map);
  });
  test(`Sequence`, () => {
    const src = `!!import/dirMerge simples/seq`;
    expect(read(src)).toEqual(content.simples.merged.seq);
  });
  test(`Fails on different types`, () => {
    const src = `!!import/dirMerge simples/mapseq`;
    expect(read(src)).toEqual(content.simples.merged.mapseq);
  });
});

describe(`import/dirMap`, () => {
  test(`With extra extension`, () => {
    const src = `!!import/dirMap nested`;
    const res = read(src, {
      ext: ['.yaml', '.yml', '.raml']
    });

    expect(res).toEqual(content.nested);
  });
});

describe(`import/dirSeq`, () => {
  test(`simples/mapseq`, () => {
    const src = `!!import/dirSeq simples/mapseq`;
    expect(read(src)).toEqual(content.simples.mapseq);
  });
  test(`simples/scalar`, () => {
    const src = `!!import/dirSeq simples/scalar`;
    expect(read(src)).toEqual([
      content.simples.scalar.num,
      content.simples.scalar.string
    ]);
  });
});
