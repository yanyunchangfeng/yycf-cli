import convict from 'convict';

export const gitServerConfig = convict({
  gitServers: {
    doc: 'Git servers configurations',
    format: Object,
    default: {
      github: {
        origin: null,
        Authorization: null,
        orgs: null,
        user: null,
        type: 'github'
      }
    }
  },
  defaults: {
    defaultGitServer: {
      doc: 'The default selected option',
      format: String,
      default: ''
    },
    gitServerConfigured: {
      doc: 'The default configed option',
      format: Boolean,
      default: false
    }
  }
});

gitServerConfig.validate({ allowed: 'strict' });
