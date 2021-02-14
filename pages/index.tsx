import React from 'react'
import { App } from 'components'

// import { twitterClient }count } from 'lib/server/sync'

export const getStaticProps = async () => {
  try {
    // const index = await getIndex()
    // await syncAccount(twitterClient, index, true)
    // console.log(index)

    return {
      props: {},
      revalidate: 10
    }
  } catch (err) {
    console.error('page error', err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export default function NotionDomainPage(props) {
  return <App {...props} />
}
