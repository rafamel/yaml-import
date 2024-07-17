export default {
  parsers: { ignores: { astFormat: 'ignores', parse: (value) => value } },
  printers: { ignores: { print: (path) => path.getValue() } }
};
