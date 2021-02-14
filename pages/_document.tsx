import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <meta name='description' content='Twitter Search' />
          <meta property='og:description' content='Twitter Search' />

          <meta name='theme-color' content='#EB625A' />
          <meta property='og:type' content='website' />

          <link rel='shortcut icon' href='/favicon.png' />

          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/apple-touch-icon.png'
          />
          <link
            rel='icon'
            type='image/png'
            sizes='96x96'
            href='/favicon-96x96.png'
          />
          <link
            rel='icon'
            type='image/png'
            sizes='32x32'
            href='/favicon-32x32.png'
          />
          <link
            rel='icon'
            type='image/png'
            sizes='16x16'
            href='/favicon-16x16.png'
          />

          <link rel='manifest' href='/manifest.json' />
        </Head>

        <body>
          <script src='noflash.js' />

          <Main />

          <NextScript />
        </body>
      </Html>
    )
  }
}
