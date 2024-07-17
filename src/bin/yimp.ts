#!/usr/bin/env node

import process from 'node:process';

import { error } from 'cli-belt';

import main from './main';

main(process.argv.slice(2)).catch((err) => {
  return error(err, { exit: 1, debug: false });
});
