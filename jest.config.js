module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRunner: 'jest-jasmine2',
  // https://github.com/facebook/jest/issues/118#issuecomment-51776139
  // https://jestjs.io/docs/en/configuration.html#setupfilesafterenv-array

  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/../$1',
  },
};
