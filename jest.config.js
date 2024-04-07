module.exports = {
  preset: 'ts-jest',
  verbose: true,
  transform: {
    '.ts': ['ts-jest', { tsconfig: './tsconfig.test.json' }],
  },
};