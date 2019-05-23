const project = require('./project.config');

const vars = {
  node: !process.env.ESNEXT,
  typescript: project.get('typescript')
};

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      vars.node
        ? { targets: { node: '8.0.0' } }
        : { modules: false, spec: true, targets: { esmodules: true } }
    ],
    vars.typescript && '@babel/typescript'
  ].filter(Boolean),
  plugins: [
    ['babel-plugin-module-resolver', { alias: { '~': './src' } }],
    ['@babel/plugin-proposal-decorators', false],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    vars.node && 'dynamic-import-node'
  ].filter(Boolean),
  ignore: ['node_modules', '**/*.d.ts']
};
