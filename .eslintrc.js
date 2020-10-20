module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],

    },
    plugins: [
        '@typescript-eslint',
        "jest",
    ],
    extends: [
        "@pixi/eslint-config",
        "plugin:jest/recommended",
        "plugin:jest/style"
    ]
};