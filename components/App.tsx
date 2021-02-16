import React from 'react'

import { Button, CSSReset, ThemeProvider } from '@chakra-ui/core'

import { QueryParamProvider } from './QueryParamProvider'
import { TweetIndexSearch } from './TweetIndexSearch/TweetIndexSearch'
import { LoadingIndicator } from './LoadingIndicator/LoadingIndicator'
import { Paper } from './Paper/Paper'
import { GitHubShareButton } from './GitHubShareButton'
import * as sdk from '../lib/client/sdk'

import styles from './styles.module.css'

export class App extends React.Component {
  state = {
    status: 'ready',
    loading: false,
    syncing: false,
    searchIndex: {
      indexName: 'tweets',
      exists: true
    },
    error: null
  }

  componentDidMount() {
    this._reset(false)
  }

  render() {
    const { status, loading, syncing, searchIndex, error } = this.state

    const isFree = false

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
                  Your twitter history will continue syncing in the background.
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

        <QueryParamProvider>
          <div className={styles.body}>
            <GitHubShareButton />

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
        </QueryParamProvider>
      </ThemeProvider>
    )
  }

  _reset = (loading = true) => {
    this.setState({ loading })

    sdk
      .getIndex()
      .then((searchIndex) => {
        if (!searchIndex.exists) {
          this._sync({ first: true })
        }

        this.setState({ status: 'ready', loading: false, searchIndex })
      })
      .catch((err) => {
        console.error(err)
        this.setState({ status: 'error', error: err.message, loading: false })
      })
  }

  _sync = (opts: any = {}) => {
    this.setState({ loading: true, syncing: true })

    const onDone = (searchIndex = this.state.searchIndex) => {
      this.setState({
        status: 'ready',
        loading: false,
        syncing: false,
        searchIndex
      })
    }

    let timeout = null
    if (!opts.first && this.state.status !== 'error') {
      timeout = setTimeout(onDone, 8000)
    }

    sdk
      .syncIndex()
      .then((searchIndex) => {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }

        if (opts.first) {
          timeout = setTimeout(() => onDone(searchIndex), 3000)
        } else {
          onDone(searchIndex)
        }
      })
      .catch((err) => {
        console.error(err)

        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }

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
