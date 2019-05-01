// prettier-ignore
const { series, parallel, ensure, line, json, log, confirm, silent, rm, remove, copy } = require('kpo');
const { merge } = require('slimconf');
const project = require('./project.config');

// prettier-ignore
verify('nodeOnly', 'typescript', 'ext.js', 'ext.ts', 'paths.docs', 'release.build', 'release.docs');
const vars = {
  node: !!project.nodeOnly,
  commit: !!process.env.COMMIT,
  prompt: !!process.env.COMMIT && !process.env.COMMITIZEN,
  ext: extensions(),
  dotExt: '.' + extensions().replace(/,/g, ',.')
};

module.exports = {
  start: 'kpo watch',
  build: {
    default: 'kpo validate build.force',
    force: series.env('kpo build.pack build.types', { NODE_ENV: 'production' }),
    $pack: [ensure`./pkg`, 'pack build', copy(['.npmignore'], './pkg')].concat(
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
  publish: series('npm publish', { cwd: './pkg' }),
  watch: {
    default: line`onchange "./src/**/*.{${vars.ext}}" --initial --kill 
  -- kpo watch.task`,
    $task: [
      log`\x1Bc⚡`,
      parallel(['kpo build.pack build.types', 'kpo lint'], {
        names: ['build', 'eslint'],
        colors: ['blue', 'yellow']
      })
    ]
  },
  fix: {
    default: 'kpo fix.format fix.scripts',
    format: `prettier --write "./**/*.{${vars.ext},json,scss}"`,
    scripts: 'kpo :raise --confirm --fail'
  },
  types: project.typescript && 'tsc --noEmit --emitDeclarationOnly false',
  lint: {
    default: `eslint ./src ./test --ext ${vars.dotExt}`,
    md: 'markdownlint README.md --config markdown.json',
    scripts: 'kpo :raise --dry --fail'
  },
  test: {
    default: 'kpo lint types test.force',
    force: series.env('jest', { NODE_ENV: 'test' }),
    watch: {
      default: line`onchange "./{src,test}/**/*.{${vars.ext}}" 
        --initial --kill -- kpo test.watch.task`,
      $task: [log`\x1Bc⚡`, 'kpo test']
    }
  },
  validate: [
    vars.prompt &&
      confirm("Commits should be done via 'npm run commit'. Continue?", {
        timeout: 5000,
        no: Error()
      }),
    'kpo test lint.md lint.scripts',
    silent`npm outdated`,
    vars.commit && confirm({ timeout: 5000, no: Error() })
  ],
  docs: project.typescript && [
    rm`${project.paths.docs}`,
    `typedoc --out "${project.paths.docs}" ./src`
  ],
  changelog: 'conventional-changelog -p angular -i CHANGELOG.md -s -r 0',
  update: ['npm update', 'npm outdated'],
  clean: {
    default: 'kpo clean.top clean.modules',
    top: remove(
      [`./pkg`, `${project.paths.docs}`, `./coverage`, `CHANGELOG.md`],
      { confirm: true }
    ),
    modules: remove('./node_modules', { confirm: true })
  },
  commit: series.env('git-cz', { COMMITIZEN: '#' }),
  /* Hooks */
  $precommit: series.env('kpo validate', { COMMIT: '#' }),
  prepublishOnly: Error("Publish should be done via 'npm run publish'"),
  preversion: [
    log`Recommended version bump is:`,
    'conventional-recommended-bump --preset angular --verbose',
    confirm({ no: Error() })
  ],
  version: [
    'kpo changelog',
    project.release.docs && 'kpo docs',
    project.release.build && 'kpo build',
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
