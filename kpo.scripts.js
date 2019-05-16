// prettier-ignore
const { series, parallel, ensure, line, json, log, confirm, rm, remove, kpo, silent } = require('kpo');
const path = require('path');
const bump = require('conventional-recommended-bump');
const { promisify } = require('util');
const { merge } = require('slimconf');
const project = require('./project.config');

// prettier-ignore
verify('nodeOnly', 'typescript', 'ext.js', 'ext.ts', 'paths.docs', 'release.build', 'release.docs');
const vars = {
  node: !!project.nodeOnly,
  semantic: !!process.env.SEMANTIC,
  commit: !!process.env.COMMITIZEN || !!process.env.SEMANTIC,
  ext: extensions(),
  dotExt: '.' + extensions().replace(/,/g, ',.')
};

module.exports.scripts = {
  start: kpo`watch`,
  build: {
    default: kpo`validate build.force`,
    force: series.env('kpo build.pack build.types', { NODE_ENV: 'production' }),
    $pack: [ensure`./pkg`, 'pack build'].concat(
      vars.node && [
        line`babel src --out-dir ./pkg/dist-node
        --extensions ${vars.dotExt} --source-maps inline`,
        json('./pkg/package.json', (pkg) => {
          if (pkg.main || pkg.module || pkg.esnext) throw Error(`!node pack`);
          return merge(pkg, { main: 'dist-node/index.js' });
        })
      ]
    ),
    $types: project.typescript && [
      `ttsc --project ttsconfig.json --outDir ./pkg/dist-types/`,
      json('./pkg/package.json', (pkg) => {
        return merge(pkg, { types: 'dist-types/index.d.ts' });
      }),
      log`Declaration files built`
    ]
  },
  commit: series.env('git-cz', { COMMITIZEN: '#' }),
  semantic: ([type]) =>
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
      parallel(['kpo build.pack build.types', 'kpo lint'], {
        names: ['build', 'eslint'],
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
    project.release.docs && kpo`docs`,
    project.release.build && kpo`build`,
    'git add .'
  ]
};

function verify(...arr) {
  arr.forEach((key) => project.get(key));
}

function extensions() {
  return (project.typescript ? project.ext.ts.split(',') : [])
    .concat(project.ext.js)
    .filter(Boolean)
    .join(',');
}
