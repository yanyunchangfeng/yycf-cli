import convict from 'convict';
import { pluginPath } from '../shared';

export const pluginConfig = convict({
  plugins: {
    doc: 'plugin configurations',
    format: Array,
    default: [
      { name: 'clearLogs', enabled: false, async: false },
      { name: 'initLogs', enabled: true, async: false },
      { name: 'clearCacheRepository', enabled: false, async: false },
      { name: 'loadConfig', enabled: true, async: false },
      { name: 'userPrompts', enabled: true, async: false },
      { name: 'createProject', enabled: true, async: false },
      { name: 'cacheRepository', enabled: true, async: false },
      { name: 'downloadRepository', enabled: true, async: false },
      { name: 'writePkg', enabled: true, async: false },
      { name: 'setUpYarn', enabled: true, async: false },
      { name: 'customEslintReport', enabled: false, async: true },
      { name: 'innerEslintReport', enabled: false, async: true },
      { name: 'jscpdReport', enabled: false, async: true },
      { name: 'madgeReport', enabled: false, async: true },
      { name: 'platoReport', enabled: false, async: true },
      { name: 'installDependencies', enabled: false, async: true }
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
    default: [
      'initLogs',
      'loadConfig',
      'createProject',
      'setUpYarn',
      'downloadRepository',
      'writePkg',
      'userPrompts',
      'cacheRepository',
      'customEslintReport'
    ]
  },
  disabledPlugins: {
    doc: 'required plugins',
    format: Array,
    default: ['customEslintReport']
  },
  platoArgs: {
    doc: 'plato args',
    format: Array,
    default: ['-r', '-d', 'plato-report', '-x', "'^(?!dist|out)/*'", '*']
  },
  jscpdArgs: {
    doc: 'jscpd args',
    format: Array,
    default: ['-p', '"**/*.{ts,tsx}"', '-r', 'json', '-o', 'jscpd-report']
  },
  madgeArgs: ['--extensions', 'ts,tsx', '*', '-i', 'madge-report/report.png']
});

pluginConfig.validate({ allowed: 'strict' });
pluginConfig.loadFile(pluginPath);
