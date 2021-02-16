import React from 'react'
import { fetchTweetAst } from 'static-tweets'
import { Tweet } from 'react-static-tweets'

// const tweetId = '1238918791947522049'
// const tweetId = '1358199505280262150'
// const tweetId = '1358581276576391172'
const tweetId = '1358199505280262150'

export const getStaticProps = async () => {
  try {
    const tweetAst = await fetchTweetAst(tweetId)

    return {
      props: {
        tweetId,
        tweetAst
      },
      revalidate: 10
    }
  } catch (err) {
    console.error('error fetching tweet info', tweetId, err)

    throw err
  }
}

export default function TweetTestPage({ tweetId, tweetAst }) {
  return <Tweet id={tweetId} ast={tweetAst} />
}
