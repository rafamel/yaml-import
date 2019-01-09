const path = require('path');
const { CONFIG_DIR } = require('./project.config');
require(path.join(CONFIG_DIR, 'setup/jake'));
