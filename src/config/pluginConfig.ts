import convict from 'convict';
import { pluginPath } from '../shared';

export const pluginConfig = convict({
  plugins: {
    doc: 'plugin configurations',
    format: Array,
    default: [
      { name: 'clearLogs', enabled: false, async: false, resourceIntensive: false },
      { name: 'initLogs', enabled: true, async: false, resourceIntensive: false },
      { name: 'clearCacheRepository', enabled: false, async: false, resourceIntensive: false },
      { name: 'loadConfig', enabled: true, async: false, resourceIntensive: false },
      { name: 'userPrompts', enabled: true, async: false, resourceIntensive: false },
      { name: 'createProject', enabled: true, async: false, resourceIntensive: false },
      { name: 'cacheRepository', enabled: true, async: false, resourceIntensive: false },
      { name: 'downloadRepository', enabled: true, async: false, resourceIntensive: false },
      { name: 'writePkg', enabled: true, async: false, resourceIntensive: false },
      { name: 'initGit', enabled: true, async: false, resourceIntensive: false },
      { name: 'customEslintReport', enabled: false, async: true, resourceIntensive: false },
      { name: 'innerEslintReport', enabled: false, async: true, resourceIntensive: false },
      { name: 'jscpdReport', enabled: false, async: true, resourceIntensive: false },
      { name: 'madgeReport', enabled: false, async: true, resourceIntensive: false },
      { name: 'platoReport', enabled: false, async: true, resourceIntensive: true },
      { name: 'installDependencies', enabled: false, async: true, resourceIntensive: true }
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
    default: ['@eslint/config@latest']
  },
  eslintArgs: {
    doc: 'eslint args',
    format: Array,
    default: ['-c', 'eslint.config.cjs', '-f', 'json', '-o', 'eslint-report/report.json', '||', 'true']
  },
  requiredPlugins: {
    doc: 'required plugins',
    format: Array,
    default: [
      'initLogs',
      'loadConfig',
      'createProject',
      'downloadRepository',
      'writePkg',
      'userPrompts',
      'cacheRepository',
      'initGit'
    ]
  },
  disabledPlugins: {
    doc: 'disabled plugins',
    format: Array,
    default: ['customEslintReport']
  },
  ignoreRepos: {
    doc: 'can not download or non-fe repos',
    format: Array,
    default: [
      'Monitoring',
      'argocd-example-apps',
      'dify',
      'Embedding Deployment',
      'entity_extraction',
      'ok2k8s',
      'sup-chat-gateway',
      'ppt-ui',
      'word-ui',
      'back-management-vite',
      'back-management',
      'data-mind'
    ]
  },
  platoArgs: {
    doc: 'plato args',
    format: Array,
    default: ['-r', '-d', 'plato-report', '-x', "'.*(vendor|polyfill|react|lodash).*'", 'dist', 'out/_next', 'bin']
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
