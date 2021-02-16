import React from 'react'
import Masonry from 'react-masonry-css'
import { Tweet } from 'react-static-tweets'
import cs from 'classnames'
import debounce from 'lodash.debounce'

import {
  withQueryParams,
  StringParam,
  BooleanParam,
  withDefault
} from 'use-query-params'

// TODO: add infinite scroll instead of manual "load more" button
// import { InfiniteScroll } from 'react-simple-infinite-scroll'

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

import { searchClient } from 'lib/client/algolia'
import { InlineTweet } from '../InlineTweet/InlineTweet'

import styles from './styles.module.css'

// TODO: add ability to filter by replies vs top-level tweets
const tooltips = {
  is_retweet: 'Do you want to include tweets that you retweeted?',
  is_favorite: 'Do you want to include tweets that you liked (favorited)?'
}

const SearchConfig = React.createContext<any>({})

export class TweetIndexSearchImpl extends React.Component<any> {
  state = {
    focusedTweet: null
  }

  _onChangeSearchQueryThrottle: any

  constructor(props) {
    super(props)

    this._onChangeSearchQueryThrottle = debounce(
      this._onChangeSearchQuery.bind(this),
      2000
    )
  }

  componentWillUnmount() {
    this._onChangeSearchQueryThrottle.cancel()
  }

  render() {
    const { indexName, query } = this.props
    const { focusedTweet } = this.state
    const {
      format: resultsFormat,
      likes: includeLikes,
      retweets: includeRetweets,
      query: searchQuery = '',
      user: userFilter
    } = query

    // console.log('render', query)
    const searchQueryDecoded = decodeURIComponent(searchQuery)

    return (
      <SearchConfig.Provider
        value={{ resultsFormat, onFocusTweet: this._onFocusTweet }}
      >
        <InstantSearch indexName={indexName} searchClient={searchClient}>
          <Configure hitsPerPage={20} />

          <SearchBox
            showLoadingIndicator
            onChange={this._onChangeSearchQueryThrottle}
            defaultRefinement={searchQueryDecoded}
          />

          <div className={styles.filters}>
            <Menu
              attribute='user.screen_name'
              limit={30}
              defaultRefinement={userFilter}
              onChange={this._onChangeUserFilter}
            />

            <ToggleRefinement
              attribute='is_retweet'
              label='Include retweets?'
              value={includeRetweets}
              defaultRefinement={!includeRetweets}
              onChange={this._onChangeIncludeRetweets}
            />

            <ToggleRefinement
              attribute='is_favorite'
              label='Include likes?'
              value={includeLikes}
              defaultRefinement={!includeLikes}
              onChange={this._onChangeIncludeLikes}
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
                <Tweet id={focusedTweet} />
              </div>
            )}

            <InfiniteHits />
          </div>
        </InstantSearch>
      </SearchConfig.Provider>
    )
  }

  _onChangeResultsFormat = (event) => {
    const { value } = event.target

    if (value !== 'list') {
      this.props.setQuery({ format: value })
    } else {
      this.props.setQuery({ format: undefined })
    }
  }

  _onChangeIncludeLikes = (value) => {
    if (value) {
      this.props.setQuery({ likes: !value })
    } else {
      this.props.setQuery({ likes: undefined })
    }
  }

  _onChangeIncludeRetweets = (value) => {
    if (value) {
      this.props.setQuery({ retweets: !value })
    } else {
      this.props.setQuery({ retweets: undefined })
    }
  }

  _onChangeSearchQuery = (value = '') => {
    if (value) {
      const query = encodeURIComponent(value)
      this.props.setQuery({ query })
    } else {
      this.props.setQuery({ query: undefined })
    }
  }

  _onChangeUserFilter = (value) => {
    if (value) {
      this.props.setQuery({ user: value })
    } else {
      this.props.setQuery({ user: undefined })
    }
  }

  _onFocusTweet = (tweetId) => {
    this.setState({ focusedTweet: tweetId })
  }
}

const SearchBoxImpl = ({
  currentRefinement,
  isSearchStalled,
  refine,
  onChange
}) => (
  <form
    noValidate
    action=''
    role='search'
    className={styles.searchBox}
    onSubmit={(e) => {
      e.preventDefault()
      return false
    }}
  >
    <InputGroup>
      <InputLeftElement children={<Icon name='search' color='gray.300' />} />

      <Input
        placeholder='Search your twitter history'
        aria-label='Tweet Search'
        type='search'
        variant='outline'
        size='lg'
        value={currentRefinement}
        onChange={(event) => {
          const { value } = event.currentTarget

          refine(value)

          if (onChange) {
            onChange(value)
          }
        }}
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
  return (
    <SearchConfig.Consumer>
      {(config) => {
        const body = hits.map((hit) => (
          <Hit key={hit.objectID} hit={hit} config={config} />
        ))

        return (
          <div
            className={cs(styles.infiniteHits, styles[config.resultsFormat])}
          >
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
        )
      }}
    </SearchConfig.Consumer>
  )
}

const InfiniteHits = connectInfiniteHits(InfiniteHitsImpl)

const ToggleRefinementImpl = ({
  currentRefinement,
  attribute,
  label,
  refine,
  onChange
}) => (
  <Flex justify='center' align='center' className={styles.filter}>
    <Tooltip
      placement='top'
      hasArrow={true}
      label={tooltips[attribute]}
      aria-label={tooltips[attribute]}
      showDelay={150}
    >
      <FormLabel htmlFor={attribute}>{label}</FormLabel>
    </Tooltip>

    <Switch
      id={attribute}
      isChecked={!currentRefinement}
      onChange={() => {
        const newValue = !currentRefinement

        if (onChange) {
          onChange(newValue)
        } else {
          refine(newValue)
        }
      }}
    />
  </Flex>
)

const ToggleRefinement = connectToggleRefinement(ToggleRefinementImpl)

const MenuImpl = ({
  attribute,
  items,
  currentRefinement,
  refine,
  onChange
}) => (
  <Select
    rootProps={{ className: styles.select }}
    name={attribute}
    placeholder='Filter by user'
    value={currentRefinement || ''}
    onChange={(event) => {
      const { value } = event.target

      if (onChange) {
        onChange(value)
      } else {
        refine(value)
      }
    }}
  >
    {items.map((item) => (
      <option key={item.label} value={item.label}>
        {item.label} ({item.count})
      </option>
    ))}
  </Select>
)

const Menu = connectMenu(MenuImpl)

export class Hit extends React.Component<any> {
  render() {
    const { hit, config, ...rest } = this.props

    if (config.resultsFormat === 'compact') {
      return (
        <InlineTweet
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
      )
    } else {
      return (
        <Tweet className={styles.hit} id={hit.id_str} ast={hit.ast} {...rest} />
      )
    }
  }
}

export const TweetIndexSearch = withQueryParams(
  {
    format: withDefault(StringParam, 'list'),
    likes: withDefault(BooleanParam, true),
    retweets: withDefault(BooleanParam, true),
    query: StringParam,
    user: StringParam
  },
  TweetIndexSearchImpl
)
