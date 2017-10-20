#!/usr/bin/env node
'use strict';
const yimp = require('../lib');
const yaml = require('js-yaml');
const path = require('path');
const yargs = require('yargs');

const argv = yargs
    .alias('i', 'input')
    .describe('i', 'Path to input file')
    .alias('o', 'output')
    .describe('o', 'Path to output file (optional)')
    .alias('e', 'ext')
    .describe('e', 'Extension array (comma separated, optional)')
    .version('version')
    .help('help')
    .showHelpOnFail(true)
    .argv;

const cleanPath = (x) => (x[0] === path.sep) ? x : path.join(process.cwd(), x);

(() => {
    if (typeof argv.i !== 'string' || argv.i.length < 1
        || (argv.o !== undefined && (typeof argv.o !== 'string' || argv.o.length < 1))
        || (argv.e !== undefined && typeof argv.e !== 'string')
    ) {
        return yargs.showHelp();
    }

    let options = {};
    if (argv.e) {
        options.ext = argv.e.split(',').map(x => `.${x}`);
    }

    const input = cleanPath(argv.i);
    if (!argv.o) {
        process.stdout.write(yaml.dump(yimp.read(input, options)));
        return;
    }

    const output = cleanPath(argv.o);
    yimp.write(input, output, options);
})();
