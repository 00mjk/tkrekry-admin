exports.config = {
  app_name : ['TKRekry'],
  license_key : process.env.NEW_RELIC_LICENSE_KEY,
  logging : {
    level : 'info'
  },
  capture_params : true,
  agent_enabled: true,
  error_collector: {
    enabled: true
  },
  browser_monitoring: {
    enable: true
  }
};