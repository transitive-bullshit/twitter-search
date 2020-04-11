import SaasifySDK from 'saasify-sdk'

export const sdk = new SaasifySDK({
  projectId: 'dev/simple-cron',
  developmentToken: process.env.REACT_APP_SAASIFY_TOKEN,
  developmentTargetUrl: 'http://localhost:4000'
})
