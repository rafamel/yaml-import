#!/usr/bin/env node

import main from './main';
import { error } from 'cli-belt';

main(process.argv.slice(2)).catch((err) => {
  return error(err, { exit: 1, debug: false });
});
