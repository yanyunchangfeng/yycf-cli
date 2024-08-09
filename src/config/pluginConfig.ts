import convict from 'convict';
import { pluginPath } from '../shared';

const pluginsConfig = convict({
  plugins: {
    doc: 'plugins configurations',
    format: Array,
    default: [
      { name: 'loadConfig', enabled: true },
      { name: 'clearCacheRepository', enabled: false },
      { name: 'createProject', enabled: true },
      { name: 'cacheRepository', enabled: true },
      { name: 'downloadRepository', enabled: true },
      { name: 'writePkg', enabled: true },
      { name: 'setUpYarn', enabled: true },
      { name: 'generatorEslintReport', enabled: true },
      { name: 'installDependencies', enabled: true }
    ]
  },
  eslintPkgs: {
    doc: 'eslint packages',
    format: Array,
    default: ['eslint', 'globals', '@eslint/js', 'typescript-eslint', 'eslint-plugin-react', 'typescript']
  },
  requiredPlugins: {
    doc: 'required plugins',
    format: Array,
    default: ['loadConfig', 'createProject', 'setUpYarn', 'downloadRepository', 'writePkg']
  }
});

pluginsConfig.validate({ allowed: 'strict' });
pluginsConfig.loadFile(pluginPath);

export default pluginsConfig;
