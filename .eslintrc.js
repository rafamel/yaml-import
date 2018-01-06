// npm i --save-dev eslint eslint-config-standard eslint-plugin-import eslint-plugin-jest eslint-plugin-node eslint-plugin-promise eslint-plugin-standard
module.exports = {
    extends: 'standard',
    env: {
      node: true,
      jasmine: true,
      jest: true
    },
    plugins: [
        "jest"
    ],
    globals: {

    },
    rules: {
        // Console.log
        'no-console': 1,
        // Indentation
        "indent": [ 2, 4 ],
        // Semicolons
        "semi": [2, "always"],
        // Space before function parenthesis
        "space-before-function-paren": [2, {
            "anonymous": "always",
            "named": "never",
            "asyncArrow": "always"
        }],
        // Template strings inner spacing
        "template-curly-spacing": 0,
        "operator-linebreak": [2, "before"],
        // Line length
        "max-len": [2, {
            "code": 90,
            "ignoreUrls": true,
            "ignoreComments": true,
            "ignoreStrings": true,
            "ignoreTemplateLiterals": true,
            "ignoreRegExpLiterals": true
        }]
    }
};
