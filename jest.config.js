/* Root-level Jest config using projects (monorepo-friendly). */
module.exports = {
  projects: ['<rootDir>/backend'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};