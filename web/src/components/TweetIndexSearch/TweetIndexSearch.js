import React from 'react'
import Masonry from 'react-masonry-css'
import TweetEmbed from 'react-tweet-embed'
// import { InfiniteScroll } from 'react-simple-infinite-scroll'
import cs from 'classnames'

import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
  connectSearchBox,
  connectToggleRefinement,
  connectMenu,
  connectStats
} from 'react-instantsearch-dom'

import {
  Button,
  Flex,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Switch,
  Tooltip
} from '@chakra-ui/core'

import { searchClient } from '../../lib/algolia'
import { Tweet } from '../Tweet/Tweet'

import styles from './styles.module.css'

const tooltips = {
  is_retweet: 'Do you want to include tweets that you retweeted?',
  is_favorite: 'Do you want to include tweets that you liked (favorited)?'
}

const SearchConfig = React.createContext()

export class TweetIndexSearch extends React.Component {
  state = {
    resultsFormat: 'compact',
    focusedTweet: null
  }

  render() {
    const { indexName } = this.props
    const { resultsFormat, focusedTweet } = this.state

    return (
      <SearchConfig.Provider
        value={{ resultsFormat, onFocusTweet: this._onFocusTweet }}
      >
        <InstantSearch indexName={indexName} searchClient={searchClient}>
          <Configure hitsPerPage={20} />

          <SearchBox showLoadingIndicator />

          <div className={styles.filters}>
            <Menu attribute='user.screen_name' limit={30} />

            <ToggleRefinement
              attribute='is_retweet'
              label='Include retweets?'
              value={false}
              defaultRefinement={false}
            />

            <ToggleRefinement
              attribute='is_favorite'
              label='Include likes?'
              value={false}
              defaultRefinement={false}
            />

            <Select
              rootProps={{ className: styles.resultsFormat }}
              name='resultsFormat'
              isRequired={true}
              value={resultsFormat}
              onChange={this._onChangeResultsFormat}
            >
              <option value='list'>List</option>
              <option value='grid'>Grid</option>
              <option value='compact'>Compact</option>
            </Select>
          </div>

          <Stats />

          <div className={styles.results}>
            {focusedTweet && (
              <div key={focusedTweet} className={styles.focusedTweet}>
                <TweetEmbed id={focusedTweet} options={{ cards: 'hidden' }} />
              </div>
            )}

            <InfiniteHits />
          </div>
        </InstantSearch>
      </SearchConfig.Provider>
    )
  }

  _onChangeResultsFormat = (event) => {
    this.setState({ resultsFormat: event.target.value })
  }

  _onFocusTweet = (tweetId) => {
    this.setState({ focusedTweet: tweetId })
  }
}

const SearchBoxImpl = ({ currentRefinement, isSearchStalled, refine }) => (
  <form noValidate action='' role='search' className={styles.searchBox}>
    <InputGroup isFullWidth>
      <InputLeftElement children={<Icon name='search' color='gray.300' />} />

      <Input
        placeholder='Search your twitter history'
        aria-label='Tweet Search'
        type='search'
        variant='outline'
        size='lg'
        value={currentRefinement}
        onChange={(event) => refine(event.currentTarget.value)}
      />

      {isSearchStalled && (
        <InputRightElement
          children={<Icon name='spinner' color='yellow.300' />}
        />
      )}
    </InputGroup>
  </form>
)

const SearchBox = connectSearchBox(SearchBoxImpl)

const StatsImpl = ({ processingTimeMS, nbHits }) => (
  <p className={styles.stats}>
    Found {nbHits} tweets in {processingTimeMS} ms
  </p>
)

const Stats = connectStats(StatsImpl)

const InfiniteHitsImpl = ({ hits, hasMore, refineNext }) => {
  const body = hits.map((hit) => <Hit key={hit.objectID} hit={hit} />)

  return (
    <SearchConfig.Consumer>
      {(config) => (
        <div className={cs(styles.infiniteHits, styles[config.resultsFormat])}>
          {/* <InfiniteScroll
            throttle={250}
            threshold={300}
            hasMore={hasMore}
            onLoadMore={refineNext}
          > */}
          {config.resultsFormat === 'grid' ? (
            <Masonry
              className={styles.hits}
              breakpointCols={2}
              columnClassName={styles.hitsColumn}
            >
              {body}
            </Masonry>
          ) : (
            body
          )}
          {/* </InfiniteScroll> */}

          <Button
            isDisabled={!hasMore}
            onClick={refineNext}
            className={styles.loadMore}
          >
            Load More
          </Button>
        </div>
      )}
    </SearchConfig.Consumer>
  )
}

const InfiniteHits = connectInfiniteHits(InfiniteHitsImpl)

const ToggleRefinementImpl = ({
  currentRefinement,
  attribute,
  label,
  refine
}) => (
  <Flex justify='center' align='center' className={styles.filter}>
    <Tooltip
      placement='top'
      hasArrow={true}
      label={tooltips[attribute]}
      showDelay={150}
    >
      <FormLabel htmlFor={attribute}>{label}</FormLabel>
    </Tooltip>

    <Switch
      id={attribute}
      isChecked={!currentRefinement}
      onChange={() => refine(!currentRefinement)}
    />
  </Flex>
)

const ToggleRefinement = connectToggleRefinement(ToggleRefinementImpl)

const MenuImpl = ({ attribute, items, currentRefinement, refine }) => (
  <Select
    rootProps={{ className: styles.select }}
    name={attribute}
    placeholder='Filter by user'
    value={currentRefinement || ''}
    onChange={(event) => refine(event.target.value)}
  >
    {items.map((item) => (
      <option key={item.label} value={item.label}>
        {item.label} ({item.count})
      </option>
    ))}
  </Select>
)

const Menu = connectMenu(MenuImpl)

export class Hit extends React.Component {
  render() {
    const { hit, ...rest } = this.props

    return (
      <SearchConfig.Consumer>
        {(config) =>
          config.resultsFormat === 'compact' ? (
            <Tweet
              className={styles.hit}
              {...rest}
              onFocusTweet={config.onFocusTweet}
              config={{
                id_str: hit.id_str,
                user: {
                  avatar: hit.user.profile_image_url,
                  nickname: hit.user.screen_name,
                  name: hit.user.name
                },
                text: hit._highlightResult.text.value,
                date: new Date(hit.created_at * 1000),
                retweets: hit.retweet_count,
                likes: hit.favorite_count
              }}
            />
          ) : (
            <TweetEmbed
              className={styles.hit}
              id={hit.id_str}
              {...rest}
              options={{ cards: 'hidden' }}
            />
          )
        }
      </SearchConfig.Consumer>
    )
  }
}
