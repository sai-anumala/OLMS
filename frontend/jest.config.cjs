/** @type {import('ts-jest').JestConfigWithTsJest} \*/
module.exports = {
// Use jsdom to simulate a browser environment
testEnvironment: 'jsdom',
// Transform TS and JS files using ts-jest
transform: {
'^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
},
// Look for test files in the src directory
testMatch: ['<rootDir>/src/**/\*.{spec,test}.{ts,tsx,js,jsx}'],
// Setup file for RTL and custom matchers
setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
// Handle CSS and other asset imports
moduleNameMapper: {
'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
},
transform: {
'^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', {
tsconfig: 'tsconfig.jest.json',
}],
},
};