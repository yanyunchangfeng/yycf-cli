import convict from 'convict';
import { pluginPath } from '../shared';

export const pluginConfig = convict({
  plugins: {
    doc: 'plugin configurations',
    format: Array,
    default: [
      { name: 'clearLogs', enabled: true },
      { name: 'initLogs', enabled: true },
      { name: 'clearCacheRepository', enabled: false },
      { name: 'loadConfig', enabled: true },
      { name: 'createProject', enabled: true },
      { name: 'cacheRepository', enabled: true },
      { name: 'downloadRepository', enabled: true },
      { name: 'writePkg', enabled: true },
      { name: 'setUpYarn', enabled: true },
      { name: 'innerEslintReport', enabled: false },
      { name: 'customEslintReport', enabled: false },
      { name: 'jscpdReport', enabled: false },
      { name: 'madgeReport', enabled: false },
      { name: 'platoReport', enabled: false },
      { name: 'installDependencies', enabled: false }
    ]
  },
  eslintPkgs: {
    doc: 'eslint packages',
    format: Array,
    default: ['globals', '@eslint/js', 'typescript-eslint', 'eslint-plugin-react', 'typescript']
  },
  eslintPlugins: {
    doc: 'eslint Plugin',
    format: Array,
    default: ['@eslint/config@latest', '--config', 'eslint-config-standard']
  },
  eslintArgs: {
    doc: 'eslint args',
    format: Array,
    default: ['-f', 'json', '-o', 'eslint/report.json', '||', 'true']
  },
  requiredPlugins: {
    doc: 'required plugins',
    format: Array,
    default: ['initLogs', 'loadConfig', 'createProject', 'setUpYarn', 'downloadRepository', 'writePkg']
  },
  platoArgs: {
    doc: 'plato args',
    format: Array,
    default: ['-r', '-d', 'plato-report', 'dist/**/*.js']
  },
  jscpdArgs: {
    doc: 'jscpd args',
    format: Array,
    default: ['-p', '"**/*.{ts,tsx}"', '-r', 'json', '-o', 'jscpd-report']
  },
  madgeArgs: ['--extensions', 'ts,tsx', '*', '-i', 'madge-report/report.svg']
});

pluginConfig.validate({ allowed: 'strict' });
pluginConfig.loadFile(pluginPath);
