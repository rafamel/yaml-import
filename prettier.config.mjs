import { getSupportInfo } from 'prettier';

export default getSupportInfo()
  .then(({ languages }) => {
    return languages
      .map(({ extensions }) => extensions)
      .reduce((acc, arr) => [...acc, ...arr], [])
      .filter((ext, i, exts) => exts.indexOf(ext) === i)
      .map((ext) => ext.substring(1));
  })
  .then((arr) => `(${arr.join('|')})`)
  .then((ext) => ({
    tabWidth: 2,
    useTabs: false,
    endOfLine: 'lf',
    printWidth: 80,
    semi: true,
    singleQuote: true,
    trailingComma: 'none',
    bracketSpacing: true,
    arrowParens: 'always',
    proseWrap: 'never',
    overrides: [
      {
        files: [
          'LICENSE',
          '**/*.md',
          `**/docs/**/*.${ext}`,
          `**/{lib,pkg,out,dist,build,vendor,deploy,coverage}/**/*.${ext}`,
          `**/{.cache,.vscode,.vercel,.tsup,node_modules}/**/*.${ext}`
        ],
        options: {
          parser: 'ignores',
          plugins: ['./config/prettier.plugin.mjs']
        }
      }
    ]
  }));
