import React from 'react'
import Masonry from 'react-masonry-css'
import TweetEmbed from 'react-tweet-embed'
import cs from 'classnames'

import {
  InstantSearch,
  Configure,
  connectInfiniteHits,
  connectSearchBox,
  connectToggleRefinement,
  connectMenu
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
    resultsFormat: 'compact'
  }

  render() {
    const { indexName } = this.props
    const { resultsFormat } = this.state

    return (
      <SearchConfig.Provider value={{ resultsFormat }}>
        <InstantSearch indexName={indexName} searchClient={searchClient}>
          <Configure hitsPerPage={64} />

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
              <option value='standard'>Standard</option>
              <option value='grid'>Grid</option>
              <option value='compact'>Compact</option>
            </Select>
          </div>

          <InfiniteHits />
        </InstantSearch>
      </SearchConfig.Provider>
    )
  }

  _onChangeResultsFormat = (event) => {
    this.setState({ resultsFormat: event.target.value })
  }
}

const SearchBoxImpl = ({ currentRefinement, isSearchStalled, refine }) => (
  <form noValidate action='' role='search' className={styles.searchBox}>
    <InputGroup isFullWidth>
      <InputLeftElement children={<Icon name='search' color='gray.300' />} />

      <Input
        placeholder='Search your tweet history'
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

const InfiniteHitsImpl = ({ hits, hasMore, refineNext }) => {
  const body = hits.map((hit) => <Hit key={hit.objectID} hit={hit} />)

  return (
    <SearchConfig.Consumer>
      {(config) => (
        <div className={cs(styles.infiniteHits, styles[config.resultsFormat])}>
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

          <Button
            className={styles.loadMoreButton}
            isDisabled={!hasMore}
            onClick={refineNext}
          >
            Load more
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
