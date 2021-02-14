import React from 'react'
import Head from 'next/head'

import styles from './styles.module.css'

export const ErrorPage: React.FC<{ statusCode?: number }> = ({
  statusCode
}) => {
  const title = 'Error'

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Error Loading Page</h1>

          {statusCode && <p>Error code: {statusCode}</p>}

          <img src='/error.png' alt='Error' className={styles.errorImage} />
        </main>
      </div>
    </>
  )
}
