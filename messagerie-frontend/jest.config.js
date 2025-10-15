module.exports = {
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@clerk/nextjs$': '<rootDir>/__mocks__/@clerk/nextjs.ts',
        '^next/(.*)$': '<rootDir>/__mocks__/next/$1.ts',
    },
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.jest.config.js' }],
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jsdom',
};
