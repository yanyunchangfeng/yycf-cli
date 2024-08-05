import convict from 'convict';

const config = convict({
  gitServers: {
    doc: 'Git servers configurations',
    format: Object,
    default: {
      github: {
        origin: null,
        Authorization: null,
        orgs: null,
        user: null
      },
      gitlab: {
        origin: null,
        Authorization: null,
        orgs: null,
        user: null
      }
    }
  },
  defaults: {
    defaultGitServer: {
      doc: 'The default selected option',
      format: String,
      default: 'github'
    },
    gitServerConfigured: {
      doc: 'The default configed option',
      format: Boolean,
      default: false
    },
    eslintPkgs: {
      doc: 'Version of the YesName package',
      format: Array,
      default: ['eslint', 'globals', '@eslint/js', 'typescript-eslint', 'eslint-plugin-react', 'typescript']
    }
  }
});

config.validate({ allowed: 'strict' });
export default config;
