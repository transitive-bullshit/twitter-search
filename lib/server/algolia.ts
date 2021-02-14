import algoliasearch from 'algoliasearch'
export * from 'algoliasearch'

export const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID,
  process.env.ALGOLIA_SECRET_KEY
)
