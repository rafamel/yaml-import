const project = require('./project.config');

const vars = {
  node: project.get('nodeOnly'),
  typescript: project.get('typescript')
};

const env = { targets: { node: '8.0.0' } };
module.exports = {
  presets: [
    vars.node && ['@babel/preset-env', env],
    vars.typescript && '@babel/typescript'
  ].filter(Boolean),
  plugins: [
    ['babel-plugin-module-resolver', { alias: { '~': './src' } }],
    ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: false }],
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }]
  ],
  ignore: ['node_modules', '**/*.d.ts'],
  env: {
    test: {
      presets: vars.node
        ? undefined
        : [
            ['@babel/preset-env', env],
            vars.typescript && '@babel/typescript'
          ].filter(Boolean)
    }
  }
};
