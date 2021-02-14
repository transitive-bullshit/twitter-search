import React from 'react'

import styles from './styles.module.css'

export const Page404: React.FC<{ error?: { message: string } }> = ({
  error
}) => {
  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Page Not Found</h1>

          {error && <p>{error.message}</p>}

          <img
            src='/404.png'
            alt='404 Not Found'
            className={styles.errorImage}
          />
        </main>
      </div>
    </>
  )
}
