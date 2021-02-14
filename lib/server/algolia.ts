import algoliasearch from 'algoliasearch'
export * from 'algoliasearch'

export const client = algoliasearch(
  process.env.ALGOLIA_CLIENT_ID,
  process.env.ALGOLIA_SECRET_KEY
)
