'use strict';
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const yimp = require('../lib');

const id = (n) => `[${ String(n) }] `;
const content = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'yml/content.json'), 'utf8')
);
function read(src, options = {}) {
    options.schema = yimp.getSchema(path.join(__dirname, 'yml'), options);
    return yaml.safeLoad(src, options);
}

describe(`import/single`, () => {
    describe(`Number`, () => {
        test(id(1) + `As unquoted string`, () => {
            const src = `paths: !!import/single simples/scalar/num.yml`;
            expect(read(src)).toEqual({
                paths: content.simples.scalar.num
            });
        });
        test(id(2) + `As quoted string`, () => {
            const src = `paths: !!import/single "simples/scalar/num.yml"`;
            expect(read(src)).toEqual({
                paths: content.simples.scalar.num
            });
        });
    });
    describe(`String`, () => {
        test(id(1), () => {
            const src = `paths: !!import/single simples/scalar/string.yml`;
            expect(read(src)).toEqual({
                paths: content.simples.scalar.string
            });
        });
    });
    describe(`Mapping`, () => {
        test(id(1), () => {
            const src = `paths: !!import/single simples/map/1.yml`;
            expect(read(src)).toEqual({
                paths: content.simples.map.one
            });
        });
        test(id(2) + `From root`, () => {
            const src = `!!import/single simples/map/1.yml`;
            expect(read(src)).toEqual(content.simples.map.one);
        });
    });
    describe(`Sequence`, () => {
        test(id(1), () => {
            const src = `paths: !!import/single simples/seq/1.yml`;
            expect(read(src)).toEqual({
                paths: content.simples.seq.one
            });
        });
        test(id(2) + `From root`, () => {
            const src = `!!import/single simples/seq/1.yml`;
            expect(read(src)).toEqual(content.simples.seq.one);
        });
        test(id(3) + `Nested (one level)`, () => {
            const src = `!!import/single nested/one-level.yml`;
            expect(read(src)).toEqual(content.nested.oneLevel);
        });
        test(id(3) + `Nested (two levels)`, () => {
            const src = `!!import/single nested/two-levels.yml`;
            expect(read(src)).toEqual(content.nested.twoLevels);
        });
    });
});

describe(`import/merge`, () => {
    test(id(1) + `Mapping`, () => {
        const src = `!!import/merge [
            'simples/map/1.yml',
            'simples/map/2.yml',
            'simples/map/3.yml'
        ]`;
        expect(read(src)).toEqual(content.simples.merged.map);
    });
    test(id(2) + `Sequence`, () => {
        const src = `!!import/merge [
            'simples/seq/1.yml',
            'simples/seq/2.yml',
            'simples/seq/3.yml'
        ]`;
        expect(read(src)).toEqual(content.simples.merged.seq);
    });
    test(id(3) + `Nested (two levels)`, () => {
        const src = `!!import/single nested/two-levels-merge.yml`;
        expect(read(src)).toEqual(content.nested.twoLevelsMerge);
    });
    test(id(4) + `Merges array for different types`, () => {
        const src = `!!import/merge [
            'simples/seq/1.yml',
            'simples/map/1.yml'
        ]`;
        let expected = content.simples.seq.one.concat();
        expected.push(content.simples.map.one);
        expect(read(src)).toEqual(expected);
    });
    test(id(5) + `Merges array for different types`, () => {
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
    test(id(1) + `Mapping`, () => {
        const src = `!!import/dirMerge simples/map`;
        expect(read(src)).toEqual(content.simples.merged.map);
    });
    test(id(2) + `Sequence`, () => {
        const src = `!!import/dirMerge simples/seq`;
        expect(read(src)).toEqual(content.simples.merged.seq);
    });
    test(id(3) + `Fails on different types`, () => {
        const src = `!!import/dirMerge simples/mapseq`;
        expect(read(src)).toEqual(content.simples.merged.mapseq);
    });
});

describe(`import/dirMap`, () => {
    test(id(1) + `With extra extension`, () => {
        const src = `!!import/dirMap nested`;
        const res = read(src, {
            ext: ['.yaml', '.yml', '.raml']
        });

        expect(res).toEqual(content.nested);
    });
});

describe(`import/dirSeq`, () => {
    test(id(1), () => {
        const src = `!!import/dirSeq simples/mapseq`;
        expect(read(src)).toEqual(content.simples.mapseq);
    });
    test(id(2), () => {
        const src = `!!import/dirSeq simples/scalar`;
        expect(read(src)).toEqual([
            content.simples.scalar.num,
            content.simples.scalar.string
        ]);
    });
});
