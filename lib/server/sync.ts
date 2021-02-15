import pRetry from 'p-retry'
import pMap from 'p-map'
import { fetchTweetAst } from 'static-tweets'
import * as algolia from './algolia'

const algoliaIndexName = process.env.ALGOLIA_INDEX_NAME || 'tweets'
const MAX_PAGE_SIZE = 200
const MAX_RESULTS = 20000

export async function syncAccount(
  twitterClient: any,
  index: algolia.SearchIndex,
  full = false
) {
  await configureIndex(index)

  const user = await twitterClient.get('account/verify_credentials')
  const opts: any = {}

  // query most recent tweets in the index to support partial re-indexing
  if (!full) {
    const resultSet = await index.search('', {
      offset: 0,
      length: MAX_PAGE_SIZE
    })
    const latest: any = resultSet.hits[resultSet.hits.length - 1]
    if (latest) {
      opts.since_id = latest.id_str
    }
  }
  console.log('sync twitter user', user.id_str, opts)

  const handlePage = async (results: any[]) => {
    const algoliaObjects = await tweetsToAlgoliaObjects(results, user)

    // const id = '1255522888834318339'
    // const tweet = results.find((t) => t.id_str === id)
    // const obj = algoliaObjects.find((t) => t.id_str === id)
    // console.debug(tweet, obj)

    await index.saveObjects(algoliaObjects)
  }

  const [numStatuses, numFavorites] = await Promise.all([
    resolvePagedTwitterQuery(
      twitterClient,
      'statuses/user_timeline',
      {
        include_rts: true,
        ...opts
      },
      handlePage
    ),
    resolvePagedTwitterQuery(twitterClient, 'favorites/list', opts, handlePage)
  ])

  console.log('statuses', numStatuses, 'favorites', numFavorites)
  return {
    numStatuses,
    numFavorites
  }
}

export async function getIndex() {
  return algolia.client.initIndex(algoliaIndexName)
}

export async function configureIndex(index: algolia.SearchIndex) {
  await index.setSettings({
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
      'user',
      'user.name',
      'user.screen_name',
      'user.profile_image_url',
      'ast'
    ],

    // make plural and singular matches count the same for these langs
    ignorePlurals: ['en']
  })
}

async function resolvePagedTwitterQuery(
  twitterClient,
  endpoint: string,
  opts: any,
  handlePage: (results: any[]) => Promise<void>
): Promise<number> {
  let numResults = 0
  let maxId: string
  let page = 0

  const count = MAX_PAGE_SIZE

  do {
    const params = { count, tweet_mode: 'extended', ...opts }
    if (maxId) {
      params.max_id = maxId
    }

    let pageResults

    try {
      pageResults = await resolveTwitterQueryPage(
        twitterClient,
        endpoint,
        params
      )
    } catch (err) {
      console.error('twitter error', { endpoint, page, numResults }, err)

      if (numResults <= 0) {
        throw err
      }
    }

    if (!pageResults.length || (page > 0 && pageResults.length <= 1)) {
      break
    }

    if (maxId) {
      pageResults = pageResults.slice(1)
    }

    maxId = pageResults[pageResults.length - 1].id_str
    numResults += pageResults.length

    console.log(
      'twitter',
      endpoint,
      `page=${page} size=${pageResults.length} total=${numResults}`
    )

    await handlePage(pageResults)

    if (numResults > MAX_RESULTS) {
      break
    }

    ++page
  } while (true)

  return numResults
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

async function tweetsToAlgoliaObjects(tweets, user) {
  // iterate over tweets and build the corresponding algolia records
  return pMap(
    tweets,
    async (tweet: any) => {
      // create the record that will be sent to algolia if there is text to index
      const algoliaTweet: any = {
        // use id_str not id (an int), as this int gets truncated in JS
        // the objectID is the key for the algolia record, and mapping
        // tweet id to object ID guarantees only one copy of the tweet in algolia
        objectID: tweet.id_str,
        id_str: tweet.id_str,
        text: tweet.full_text || tweet.text || '',
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

      try {
        console.log('twitter', '>>> fetchTweetAst', tweet.id_str)
        algoliaTweet.ast = await fetchTweetAst(tweet.id_str)
        console.log(
          'twitter',
          '<<< fetchTweetAst',
          tweet.id_str,
          algoliaTweet.ast
        )
      } catch (err) {
        console.error('error fetching tweet ast', tweet.id_str, err)
      }

      return algoliaTweet
    },
    {
      concurrency: 4
    }
  )
}
