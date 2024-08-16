import convict from 'convict';
import { pluginPath } from '../shared';

export const pluginConfig = convict({
  plugins: {
    doc: 'plugins configurations',
    format: Array,
    default: [
      { name: 'clearLogs', enabled: true },
      { name: 'clearCacheRepository', enabled: false },
      { name: 'loadConfig', enabled: true },
      { name: 'createProject', enabled: true },
      { name: 'cacheRepository', enabled: true },
      { name: 'downloadRepository', enabled: true },
      { name: 'writePkg', enabled: true },
      { name: 'setUpYarn', enabled: true },
      { name: 'innerEslintReport', enabled: false },
      { name: 'customEslintReport', enabled: false },
      { name: 'platoReport', enabled: false },
      { name: 'jscpdReport', enabled: false },
      { name: 'installDependencies', enabled: false }
    ]
  },
  eslintPkgs: {
    doc: 'eslint packages',
    format: Array,
    default: ['eslint', 'globals', '@eslint/js', 'typescript-eslint', 'eslint-plugin-react', 'typescript']
  },
  eslintPlugins: {
    doc: 'eslint Plugin',
    format: Array,
    default: ['@eslint/config@latest', '--config', 'eslint-config-standard']
  },
  requiredPlugins: {
    doc: 'required plugins',
    format: Array,
    default: ['loadConfig', 'createProject', 'setUpYarn', 'downloadRepository', 'writePkg']
  },
  platoCommand: {
    doc: 'plato Command',
    format: Array,
    default: ['plato', '-r', '-d', 'report', 'dist/*.js']
  },
  jscpdCommand: {
    doc: 'jscpd Command',
    format: Array,
    default: ['jscpd', '-p', 'src/**/*.\\{ts,tsx\\}', , '-r', 'json', '-o', 'jscpd-report']
  }
});

pluginConfig.validate({ allowed: 'strict' });
pluginConfig.loadFile(pluginPath);
