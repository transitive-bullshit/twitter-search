import React from 'react'
import { CSSReset, ThemeProvider } from '@chakra-ui/core'

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
            <h3>Syncing your Tweets...</h3>
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

        <div className={styles.body}>{content}</div>
      </ThemeProvider>
    )
  }

  _reset() {
    this.setState({ loading: true })

    sdk.api
      .get('/')
      .then(({ body: searchIndex }) => {
        console.log({ searchIndex })

        if (!searchIndex.exists) {
          this._sync()
        } else {
          this._sync()
        }

        this.setState({ loading: false, searchIndex })
      })
      .catch((err) => {
        console.error(err)
        this.setState({ status: 'error', error: err.message, loading: false })
      })
  }

  _sync() {
    this.setState({ loading: true, syncing: true })

    sdk.api
      .put('/')
      .then(({ body: searchIndex }) => {
        console.log({ searchIndex })

        this.setState({
          status: 'ready',
          loading: false,
          syncing: false,
          searchIndex
        })
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
