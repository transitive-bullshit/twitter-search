import Twitter = require('twitter-lite')

const saasifyClientId = process.env.PROVIDER_TWITTER_CLIENT_ID
const saasifyClientSecret = process.env.PROVIDER_TWITTER_CLIENT_SECRET

export async function getTwitterClient({
  clientId = saasifyClientId,
  clientSecret = saasifyClientSecret,
  accessToken,
  accessTokenSecret
}) {
  return new Twitter({
    consumer_key: clientId,
    consumer_secret: clientSecret,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret
  })
}
