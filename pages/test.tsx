import React from 'react'
import { Tweets } from '../static-tweet/tweets'
import fetchTweetAst from 'static-tweet/lib/fetchTweetAst'
import { Tweet } from 'components/tweet'

// const tweetId = '1238918791947522049'
const tweetId = '1358199505280262150'

export const getStaticProps = async () => {
  try {
    const tweetAst = await fetchTweetAst(tweetId)
    const tweets = {
      [tweetId]: tweetAst
    }

    return {
      props: {
        tweets
      },
      revalidate: 10
    }
  } catch (err) {
    console.error('error', err)

    throw err
  }
}

export default function NotionDomainPage({ tweets }) {
  return (
    <Tweets.Provider value={tweets}>
      <Tweet id={tweetId} />
    </Tweets.Provider>
  )
}
