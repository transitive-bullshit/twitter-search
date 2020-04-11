import pRetry = require('p-retry')
import * as algolia from './algolia'

const emojiRegex = require('emoji-regex')()
const urlRegex = /(?:https?|ftp):\/\/[\n\S]+/g

const MAX_PAGE_SIZE = 200
const MAX_RESULTS = 20000

export async function syncAccount(
  twitterClient: any,
  index: algolia.SearchIndex,
  plan: string = 'free'
) {
  await configureIndex(index)

  const user = await twitterClient.get('account/verify_credentials')

  const [statuses, favorites] = await Promise.all([
    resolvePagedTwitterQuery(twitterClient, 'statuses/user_timeline', plan, {
      include_rts: true
    }),
    resolvePagedTwitterQuery(twitterClient, 'favorites/list', plan)
  ])

  console.log('statuses', statuses.length, 'favorites', favorites.length)

  const tweets = statuses.concat(favorites)

  const algoliaObjects = tweetsToAlgoliaObjects(tweets, user)
  return index.saveObjects(algoliaObjects)
}

export async function getIndex(userId: string) {
  return algolia.client.initIndex(`tweets-${userId}`)
}

export async function configureIndex(index: algolia.SearchIndex) {
  await index.setSettings({
    // only the text of the tweet should be searchable
    searchableAttributes: ['text', 'user.name,user.screen_name'],

    // only highlight results in the text field
    // attributesToHighlight: ['text'],

    attributesForFaceting: [
      'filterOnly(is_retweet)',
      'filterOnly(is_favorite)',
      'user.screen_name'
    ],

    // tweets will be ranked by total count with retweets
    // counting more that other interactions, falling back to date
    customRanking: [
      'desc(created_at)',
      'desc(total_count)',
      'desc(retweet_count)'
    ],

    // return these attributes for dislaying in search results
    attributesToRetrieve: [
      'id_str',
      'is_retweet',
      'is_favorite',
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

async function resolvePagedTwitterQuery(
  twitterClient,
  endpoint: string,
  plan: string,
  opts?: any
) {
  let results = []
  let max_id = undefined
  let page = 0

  const count = plan === 'free' ? 100 : MAX_PAGE_SIZE

  do {
    const params = { count, ...opts }
    if (max_id) {
      params.max_id = max_id
    }

    let pageResults

    try {
      pageResults = await resolveTwitterQueryPage(
        twitterClient,
        endpoint,
        params
      )

      console.log({ pageResults: pageResults.length })
    } catch (err) {
      console.error('twitter error', { endpoint, page }, err)

      if (results.length <= 0) {
        throw err
      }
    }

    if (!pageResults.length || (page > 0 && pageResults.length <= 1)) {
      break
    }

    if (max_id) {
      pageResults = pageResults.slice(1)
    }

    max_id = pageResults[pageResults.length - 1].id_str
    results = results.concat(pageResults)

    console.log(
      'twitter',
      endpoint,
      `page=${page} size=${pageResults.length} total=${results.length}`
    )

    if (results.length > MAX_RESULTS) {
      break
    }

    if (plan === 'free') {
      break
    }

    ++page
  } while (true)

  return results
}

async function resolveTwitterQueryPage(
  twitterClient,
  endpoint: string,
  opts: any
) {
  console.log('twitter', endpoint, opts)

  return pRetry(() => twitterClient.get(endpoint, opts), {
    retries: 3,
    maxTimeout: 10000
  })
}

function tweetsToAlgoliaObjects(tweets, user) {
  const algoliaObjects = []

  // iterate over tweets and build the algolia record
  for (var i = 0; i < tweets.length; i++) {
    const tweet = tweets[i]
    const { text } = tweet

    // console.log(JSON.stringify(tweet, null, 2))

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
        is_retweet: !!tweet.retweeted_status,
        is_favorite: !!tweet.favorited && user.id_str !== tweet.user.id_str,
        user: {
          id_str: tweet.user.id_str,
          name: tweet.user.name,
          screen_name: tweet.user.screen_name,
          profile_image_url: tweet.user.profile_image_url
        }
      }

      algoliaObjects.push(algoliaObject)
      console.log(JSON.stringify(algoliaObject, null, 2))
    }
  }

  return algoliaObjects
}
