const path = require('path');
const scripts = (x) => ({ scripts: x });
const exit0 = (x) => `${x} || shx echo `;
const series = (...x) => `(${x.join(') && (')})`;
const dir = (file) => path.join(CONFIG_DIR, file);
const ts = (cmd) => (TYPESCRIPT ? cmd : 'shx echo');
const {
  OUT_DIR,
  DOCS_DIR,
  CONFIG_DIR,
  EXTENSIONS,
  TYPESCRIPT
} = require('./project.config');
const DOT_EXTENSIONS = '.' + EXTENSIONS.replace(/,/g, ',.');

process.env.LOG_LEVEL = 'disable';
module.exports = scripts({
  build: series(
    'nps validate',
    exit0(`shx rm -r ${OUT_DIR}`),
    `shx mkdir ${OUT_DIR}`,
    `jake fixpackage["${OUT_DIR}"]`,
    'nps private.build docs'
  ),
  publish: `nps build && cd ${OUT_DIR} && npm publish`,
  watch: `onchange "./src/**/*.{${EXTENSIONS}}" --initial --kill -- nps private.watch`,
  fix: [
    'prettier',
    `--write "./**/*.{${EXTENSIONS},.json,.scss}"`,
    `--config "${dir('.prettierrc.js')}"`,
    `--ignore-path "${dir('.prettierignore')}"`
  ].join(' '),
  types: ts(`tsc --noEmit`),
  lint: {
    default: [
      'concurrently',
      `"eslint ./src ./test --ext ${DOT_EXTENSIONS} -c ${dir('.eslintrc.js')}"`,
      `"${ts(`tslint ./{src,test}/**/*.{ts,tsx} -c ${dir('tslint.json')}`)}"`,
      '-n eslint,tslint',
      '-c yellow,blue'
    ].join(' '),
    md: `markdownlint *.md --config ${dir('markdown.json')}`,
    scripts: 'jake lintscripts[' + __dirname + ']'
  },
  test: {
    default: series('nps lint types', 'cross-env NODE_ENV=test jest'),
    watch: `onchange "./{src,test}/**/*.{${EXTENSIONS}}" --initial --kill -- jake clear run["nps test"]`
  },
  validate: series(
    'nps test lint.md lint.scripts',
    'npm outdated || jake countdown'
  ),
  update: series('npm update --save/save-dev', 'npm outdated'),
  clean: series(
    exit0(`shx rm -r ${OUT_DIR} ${DOCS_DIR} coverage`),
    'shx rm -rf node_modules'
  ),
  docs: series(
    exit0(`shx rm -r ${DOCS_DIR}`),
    ts(`typedoc --out ${DOCS_DIR} ./src`)
  ),
  // Private
  private: {
    build: [
      'concurrently',
      `"babel src --out-dir ${OUT_DIR} --extensions ${DOT_EXTENSIONS} --source-maps inline"`,
      `"${ts(`tsc --emitDeclarationOnly --outDir ${OUT_DIR}`)}"`,
      '-n babel,tsc',
      '-c green,magenta'
    ].join(' '),
    watch: series(
      'jake clear',
      'shx echo "____________\n"',
      'concurrently "nps lint" "nps private.build"'
    )
  }
});
