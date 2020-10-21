module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: "es2020", // Allows for the parsing of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
        tsconfigRootDir: "./",
        project: './tsconfig.json',

    },
    plugins: [
        '@typescript-eslint',
        "jest"
    ],
    extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        "plugin:prettier/recommended",
        "prettier/@typescript-eslint",
        "plugin:jest/recommended",
        "plugin:jest/style"
    ],

    "rules": {
        "spaced-comment": ["error", "always", { "block": { "balanced": true } }],
        "@typescript-eslint/no-unsafe-return": "off",


        "@typescript-eslint/explicit-member-accessibility": ["error", { "overrides": { constructors: 'off' } }], //soon...
        "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],

        "no-implicit-coercion": "error",

        "curly": "error",
        "@typescript-eslint/no-floating-promises": "off",
        "prefer-template": 1,
        "template-curly-spacing": [1, "never"],
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/unbound-method": "off",
        "prettier/prettier": "warn",
    },

};