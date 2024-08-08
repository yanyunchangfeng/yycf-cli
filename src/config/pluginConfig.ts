import convict from 'convict';

const pluginsConfig = convict({
  plugins: {
    doc: 'plugins configurations',
    format: Array,
    default: [
      { name: 'loadConfig', enabled: true },
      { name: 'clearCacheRepository', enabled: false },
      { name: 'createProject', enabled: true },
      { name: 'setUpYarn', enabled: true },
      { name: 'generatorEslintReport', enabled: true },
      { name: 'installDependencies', enabled: true }
    ]
  }
});

pluginsConfig.validate({ allowed: 'strict' });

export default pluginsConfig;
