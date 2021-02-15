// global styles shared across the entire site
import 'styles/global.css'

// core styles shared by all of react-static-tweets (required)
import 'react-static-tweets/styles.css'

import React from 'react'
import Head from 'next/head'

import { bootstrap } from 'lib/client/bootstrap'

if (typeof window !== 'undefined') {
  bootstrap()
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />

        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, shrink-to-fit=no'
        />
      </Head>

      <Component {...pageProps} />
    </>
  )
}
