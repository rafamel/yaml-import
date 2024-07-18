#!/usr/bin/env node

import process from 'node:process';
import util from 'node:util';

import { error } from 'cli-belt';

import { main } from './main';

main(process.argv.slice(2), (x) => process.stdout.write(util.format(x))).catch(
  (err) => error(err, { exit: 1, debug: false })
);
