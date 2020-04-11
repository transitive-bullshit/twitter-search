import * as algolia from './algolia'

const emojiRegex = require('emoji-regex')()
const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/g

export async function syncAccount(
  twitterClient: any,
  index: algolia.SearchIndex
) {
  await configureIndex(index)

  // TODO: support paging results
  const favorites = await twitterClient.get('favorites/list')
  const statuses = await twitterClient.get('statuses/user_timeline')
  const tweets = favorites.concat(statuses)

  const algoliaObjects = tweetsToAlgoliaObjects(tweets)
  return index.saveObjects(algoliaObjects)
}

export async function getIndex(userId: string) {
  return algolia.client.initIndex(`tweets-${userId}`)
}

export async function configureIndex(index: algolia.SearchIndex) {
  await index.setSettings({
    // only the text of the tweet should be searchable
    searchableAttributes: ['unordered(text)'],

    // only highlight results in the text field
    attributesToHighlight: ['text'],

    // tweets will be ranked by total count with retweets
    // counting more that other interactions, falling back to date
    customRanking: [
      'desc(total_count)',
      'desc(retweet_count)',
      'desc(created_at)'
    ],

    // return these attributes for dislaying in search results
    attributesToRetrieve: [
      'id_str',
      'text',
      'created_at',
      'retweet_count',
      'favorite_count',
      'total_count',
      'user.name',
      'user.screen_name',
      'user.profile_image_url'
    ],

    // make plural and singular matches count the same for these langs
    ignorePlurals: ['en']
  })
}

function tweetsToAlgoliaObjects(tweets) {
  const algoliaObjects = []

  // iterate over tweets and build the algolia record
  for (var i = 0; i < tweets.length; i++) {
    const tweet = tweets[i]
    const text = tweet.full_text

    // remove emojis, as they might not display correctly
    // remove urls, as we don't want to search nor display them
    const cleanText = text.replace(emojiRegex, '').replace(urlRegex, '')

    // create the record that will be sent to algolia if there is text to index
    if (cleanText.trim().length > 0) {
      const algoliaObject = {
        // use id_str not id (an int), as this int gets truncated in JS
        // the objectID is the key for the algolia record, and mapping
        // tweet id to object ID guarantees only one copy of the tweet in algolia
        objectID: tweet.id_str,
        id_str: tweet.id_str,
        text: cleanText,
        created_at: Date.parse(tweet.created_at) / 1000,
        favorite_count: tweet.favorite_count,
        retweet_count: tweet.retweet_count,
        total_count: tweet.retweet_count + tweet.favorite_count,
        user: {
          name: tweet.user.name,
          screen_name: tweet.user.screen_name,
          profile_image_url: tweet.user.profile_image_url
        }
      }

      algoliaObjects.push(algoliaObject)
    }
  }

  return algoliaObjects
}
