import convict from 'convict';

const gitServerConfig = convict({
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
      },
      gitlab: {
        origin: null,
        Authorization: null,
        orgs: null,
        user: null,
        type: 'gitlab'
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
    }
  }
});

gitServerConfig.validate({ allowed: 'strict' });
export default gitServerConfig;
