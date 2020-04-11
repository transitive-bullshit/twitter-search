import React from 'react'
import { CSSReset, ThemeProvider } from '@chakra-ui/core'

import { Button } from '@chakra-ui/core'

import { TweetIndexSearch, LoadingIndicator, Paper } from './components'
import { sdk } from './lib/sdk'

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
    sdk.ready
      .then(() => {
        this._reset()
        this.setState({ status: 'ready' })
      })
      .catch((err) => {
        console.error(err)
        this.setState({ status: 'error', error: err.message })
      })
  }

  render() {
    const { status, loading, syncing, searchIndex, error } = this.state
    console.log({ searchIndex })

    const isFree = sdk.consumer?.plan === 'free'

    let content = null

    if (status === 'bootstrapping') {
      content = (
        <Paper className={styles.content}>
          <LoadingIndicator />
        </Paper>
      )
    } else if (status === 'error') {
      content = <Paper className={styles.content}>Error: {error}</Paper>
    } else {
      content = (
        <div className={styles.content}>
          {loading && <LoadingIndicator />}

          {syncing ? (
            <>
              <h3>Syncing your Tweets...</h3>

              {isFree ? (
                <p>
                  We only sync your 100 most recent tweets on the free plan.
                </p>
              ) : (
                <p>
                  This may take a few minutes as we index your entire Twitter
                  history.
                </p>
              )}
            </>
          ) : (
            searchIndex && (
              <TweetIndexSearch indexName={searchIndex.indexName} />
            )
          )}
        </div>
      )
    }

    return (
      <ThemeProvider>
        <CSSReset />

        <div className={styles.body}>
          {!isFree && (
            <Button
              className={styles.syncButton}
              isDisabled={syncing || loading}
              leftIcon='repeat'
              onClick={this._sync}
            >
              Sync Tweets
            </Button>
          )}

          {content}
        </div>
      </ThemeProvider>
    )
  }

  _reset = () => {
    this.setState({ loading: true })

    sdk.api
      .get('/')
      .then(({ body: searchIndex }) => {
        console.log({ searchIndex })

        if (!searchIndex.exists) {
          this._sync({ first: true })
        }

        this.setState({ loading: false, searchIndex })
      })
      .catch((err) => {
        console.error(err)
        this.setState({ status: 'error', error: err.message, loading: false })
      })
  }

  _sync = (opts = {}) => {
    this.setState({ loading: true, syncing: true })

    sdk.api
      .put('/')
      .then(({ body: searchIndex }) => {
        console.log({ searchIndex })

        if (opts.first) {
          setTimeout(() => {
            this.setState({
              status: 'ready',
              loading: false,
              syncing: false,
              searchIndex
            })
          }, 3000)
        }
      })
      .catch((err) => {
        console.error(err)

        this.setState({
          status: 'error',
          error: err.message,
          syncing: false,
          loading: false,
          searchIndex: null
        })
      })
  }
}
