import React from 'react'
import cs from 'classnames'

import { useTweet } from '../static-tweet/tweets'
import Node from '../static-tweet/components/html/node'
import components from '../static-tweet/components/twitter-layout/components'
import twitterTheme from '../static-tweet/components/twitter-layout/twitter.module.css'

export const Tweet: React.FC<{
  id: string
  br?: string
  caption?: string
  className?: string
}> = ({ id, br, caption, className }) => {
  const tweet = useTweet(id)

  // Happens when `getStaticProps` is traversing the tree to collect the tweet ids
  if (tweet.ignore) return null

  return (
    <main className={cs(twitterTheme.theme, className)}>
      <Node components={components} node={tweet.ast[0]} br={br} />

      {caption != null ? <p>{caption}</p> : null}

      <style jsx>{`
        main {
          max-width: 100%;
          min-width: 220px;
          margin: 2rem auto;
        }

        p {
          font-size: 14px;
          color: #999;
          text-align: center;
          margin: 0;
          margin-top: 10px;
          padding: 0;
        }
      `}</style>
    </main>
  )
}
