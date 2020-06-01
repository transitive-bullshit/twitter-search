import React from 'react'
// import { CSSReset, ThemeProvider } from '@chakra-ui/core'

// import { Button } from '@chakra-ui/core'

import { Paper } from './components'
// import { TweetIndexSearch, LoadingIndicator, Paper } from './components'
// import { sdk } from './lib/sdk'

import styles from './styles/app.module.css'

export class App extends React.Component {
  state = {
    status: 'bootstrapping',
    loading: false,
    syncing: false,
    searchIndex: null,
    error: null
  }

  componentDidMount() {
    // sdk.ready
    //   .then(() => {
    //     this._reset()
    //     this.setState({ status: 'ready' })
    //   })
    //   .catch((err) => {
    //     console.error(err)
    //     this.setState({ status: 'error', error: err.message })
    //   })
  }

  render() {
    return (
      <Paper className={styles.content}>
        <p>
          Twitter Search has unfortunately been disabled due to abuse and
          excessive Algolia costs.
        </p>

        <p>We'll be issuing refunds shortly.</p>

        <p>
          You can still view the{' '}
          <a href='https://github.com/saasify-sh/twitter-search'>source code</a>{' '}
          on GitHub.
        </p>
      </Paper>
    )
  }

  // render() {
  //   const { status, loading, syncing, searchIndex, error } = this.state

  //   const isFree = sdk.consumer?.plan === 'free'

  //   let content = null

  //   if (status === 'bootstrapping') {
  //     content = (
  //       <Paper className={styles.content}>
  //         <LoadingIndicator />
  //       </Paper>
  //     )
  //   } else if (status === 'error') {
  //     content = <Paper className={styles.content}>Error: {error}</Paper>
  //   } else {
  //     content = (
  //       <div className={styles.content}>
  //         {loading && <LoadingIndicator />}

  //         {syncing ? (
  //           <>
  //             <h3>Syncing your Tweets...</h3>

  //             {isFree ? (
  //               <p>
  //                 We only sync your 100 most recent tweets on the free plan.
  //               </p>
  //             ) : (
  //               <p>
  //                 Your twitter history will continue syncing in the background.
  //               </p>
  //             )}
  //           </>
  //         ) : (
  //           searchIndex && (
  //             <TweetIndexSearch indexName={searchIndex.indexName} />
  //           )
  //         )}
  //       </div>
  //     )
  //   }

  //   return (
  //     <ThemeProvider>
  //       <CSSReset />

  //       <div className={styles.body}>
  //         {!isFree && (
  //           <Button
  //             className={styles.syncButton}
  //             isDisabled={syncing || loading}
  //             leftIcon='repeat'
  //             onClick={this._sync}
  //           >
  //             Sync Tweets
  //           </Button>
  //         )}

  //         {content}
  //       </div>
  //     </ThemeProvider>
  //   )
  // }

  // _reset = () => {
  //   this.setState({ loading: true })

  //   sdk.api
  //     .get('/')
  //     .then(({ body: searchIndex }) => {
  //       console.log({ searchIndex })

  //       if (!searchIndex.exists) {
  //         this._sync({ first: true })
  //       }

  //       this.setState({ loading: false, searchIndex })
  //     })
  //     .catch((err) => {
  //       console.error(err)
  //       this.setState({ status: 'error', error: err.message, loading: false })
  //     })
  // }

  // _sync = (opts = {}) => {
  //   this.setState({ loading: true, syncing: true })

  //   const onDone = (searchIndex = this.state.searchIndex) => {
  //     this.setState({
  //       status: 'ready',
  //       loading: false,
  //       syncing: false,
  //       searchIndex
  //     })
  //   }

  //   let timeout = null
  //   if (!opts.first && this.state.status !== 'error') {
  //     timeout = setTimeout(onDone, 8000)
  //   }

  //   sdk.api
  //     .put('/')
  //     .then(({ body: searchIndex }) => {
  //       console.log({ searchIndex })
  //       if (timeout) {
  //         clearTimeout(timeout)
  //         timeout = null
  //       }

  //       if (opts.first) {
  //         timeout = setTimeout(() => onDone(searchIndex), 3000)
  //       } else {
  //         onDone(searchIndex)
  //       }
  //     })
  //     .catch((err) => {
  //       console.error(err)

  //       if (timeout) {
  //         clearTimeout(timeout)
  //         timeout = null
  //       }

  //       this.setState({
  //         status: 'error',
  //         error: err.message,
  //         syncing: false,
  //         loading: false,
  //         searchIndex: null
  //       })
  //     })
  // }
}
