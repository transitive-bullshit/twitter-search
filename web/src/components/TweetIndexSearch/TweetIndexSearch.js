import React from 'react'

import Masonry from 'react-masonry-css'
import { Tweet } from 'react-fake-tweet'
import 'react-fake-tweet/dist/index.css'

import {
  InstantSearch,
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

import styles from './styles.module.css'

const tooltips = {
  is_retweet: 'Do you want to include tweets that you retweeted?',
  is_favorite: 'Do you want to include tweets that you liked (favorited)?'
}

export class TweetIndexSearch extends React.Component {
  render() {
    const { indexName } = this.props

    return (
      <InstantSearch indexName={indexName} searchClient={searchClient}>
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
        </div>

        <InfiniteHits />
      </InstantSearch>
    )
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

const InfiniteHitsImpl = ({ hits, hasMore, refineNext }) => (
  <div className={styles.infiniteHits}>
    <Masonry
      className={styles.hits}
      breakpointCols={2}
      columnClassName={styles.hitsColumn}
    >
      {hits.map((hit) => (
        <Hit key={hit.objectID} hit={hit} />
      ))}
    </Masonry>

    <Button
      className={styles.loadMoreButton}
      isDisabled={!hasMore}
      onClick={refineNext}
    >
      Load more
    </Button>
  </div>
)

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

// export class Tweet extends React.Component {
//   render() {
//     const { hit, ...rest } = this.props

//     return (
//       <TweetEmbed
//         className={styles.hit}
//         id={hit.id_str}
//         options={{ cards: 'hidden' }}
//         {...rest}
//       />
//     )
//   }
// }

export class Hit extends React.Component {
  render() {
    const { hit, ...rest } = this.props

    return (
      <Tweet
        className={styles.hit}
        {...rest}
        config={{
          user: {
            avatar: hit.user.profile_image_url,
            nickname: hit.user.screen_name,
            name: hit.user.name
          },
          text: hit.text,
          date: new Date(hit.created_at * 1000),
          retweets: hit.retweet_count,
          likes: hit.favorite_count
        }}
      />
    )
  }
}
