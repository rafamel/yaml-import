// prettier-ignore
const { series, parallel, ensure, line, json, log, confirm, rm, remove, kpo, silent, copy, glob } = require('kpo');
const path = require('path');
const { promisify } = require('util');
const project = require('./project.config');

verify('esnext', 'typescript', 'ext.js', 'ext.ts');
verify('paths.docs', 'release.build', 'release.docs');
const vars = {
  semantic: !!process.env.SEMANTIC,
  commit: !!process.env.COMMITIZEN || !!process.env.SEMANTIC,
  ext: extensions(),
  dotExt: '.' + extensions().replace(/,/g, ',.')
};

module.exports.scripts = {
  start: kpo`watch`,
  build: {
    default: series.env('kpo validate build.force', { NODE_ENV: 'production' }),
    force: kpo`build.pack build.node build.types`,
    $pack: [
      [rm`pkg`, ensure`pkg`, series.env('pack build', { ESNEXT: '#' })],
      json('./pkg/package.json', ({ json }) => {
        const fail = project.esnext
          ? !json.esnext || !json.module
          : json.esnext || json.module;
        if (fail) throw Error(`Bad @pika/pack configuration for esnext`);
        return {
          ...json,
          main: 'dist-node/index.js',
          types: project.typescript ? 'dist-types/index.d.ts' : undefined
        };
      })
    ],
    $node: series(
      'babel ./src --out-dir ./pkg/dist-node --source-maps inline',
      { args: ['--extensions', vars.dotExt] }
    ),
    $types: project.typescript && [
      `ttsc --project ttsconfig.json --outDir ./pkg/dist-types/`,
      copy(glob`./src/**/*.d.ts`, { from: 'src', to: 'pkg/dist-types' })
    ]
  },
  commit: series.env('git-cz', { COMMITIZEN: '#' }),
  semantic: ([type], bump = require('conventional-recommended-bump')) =>
    promisify(bump)({ preset: 'angular' }).then(({ reason, releaseType }) => {
      type ? log.fn`\nVersion bump: ${type}` : log.fn``;
      log.fn`Recommended version bump: ${releaseType}\n    ${reason}`;
      return confirm({
        no: Error(),
        yes: series.env(`npm version ${type ? '' : releaseType}`, {
          SEMANTIC: '#'
        })
      });
    }),
  release: [
    series('npm publish --dry-run', { cwd: './pkg' }),
    confirm({ no: Error() }),
    series('npm publish', { cwd: './pkg' }),
    series(['git push', 'git push --tags'], { args: [] })
  ],
  watch: {
    default: 'onchange ./src --initial --kill -- kpo watch.task',
    $task: [
      log`\x1Bc⚡`,
      parallel(['kpo build.force', 'kpo lint types'], {
        names: ['build', 'lint'],
        colors: ['blue', 'yellow']
      })
    ]
  },
  fix: {
    default: kpo`fix.format fix.scripts`,
    format: `prettier --write ./**/*.{${vars.ext},json,scss}`,
    scripts: kpo`:raise --purge --confirm --fail`
  },
  types: project.typescript && 'tsc --noEmit --emitDeclarationOnly false',
  lint: {
    default: `eslint ./src ./test --ext ${vars.dotExt}`,
    md: line`markdownlint README.md
      --config ${path.join(__dirname, 'markdown.json')}`,
    scripts: kpo`:raise --dry --fail`
  },
  test: {
    default: kpo`lint types test.force`,
    force: series.env('jest', { NODE_ENV: 'test' }),
    watch: {
      default: 'onchange ./{src,test} --initial --kill -- kpo test.watch.task',
      $task: [log`\x1Bc⚡`, kpo`test`]
    }
  },
  validate: [kpo`test lint.md lint.scripts`, silent`npm outdated`],
  docs: project.typescript && [
    rm`${project.paths.docs}`,
    `typedoc ./src --out "${project.paths.docs}"`
  ],
  changelog: 'conventional-changelog -p angular -i CHANGELOG.md -s -r 0',
  update: ['npm update', 'npm outdated'],
  outdated: 'npm outdated',
  clean: {
    default: kpo`clean.top clean.modules`,
    top: remove(
      [`./pkg`, `${project.paths.docs}`, `./coverage`, `CHANGELOG.md`],
      { confirm: true }
    ),
    modules: remove('./node_modules', { confirm: true })
  },
  /* Hooks */
  $precommit: [
    !vars.commit && Error(`Commit by running 'kpo commit'`),
    kpo`validate`
  ],
  prepublishOnly: Error(`Run 'kpo release'`),
  preversion: !vars.semantic && Error(`Run 'kpo semantic'`),
  version: [
    kpo`preversion`,
    kpo`changelog`,
    project.release.build && kpo`build`,
    project.release.docs && kpo`docs`,
    'git add .'
  ]
};

function verify(...arr) {
  arr.forEach((key) => project.get(key));
}

function extensions() {
  return project.ext.js
    .split(',')
    .concat(project.typescript ? project.ext.ts.split(',') : [])
    .filter(Boolean)
    .join(',');
}
