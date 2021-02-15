import React, { memo, useMemo } from 'react'
import { useRouter } from 'next/router'
import { QueryParamProvider as ContextProvider } from 'use-query-params'

export const QueryParamProviderComponent = (props: {
  children?: React.ReactNode
}) => {
  const { children, ...rest } = props
  const router = useRouter()
  const match = router.asPath.match(/[^?]+/)
  const pathname = match ? match[0] : router.asPath

  const location = useMemo(
    () =>
      process.browser
        ? window.location
        : ({
            search: router.asPath.replace(/[^?]+/u, '')
          } as Location),
    [router.asPath]
  )

  const history = useMemo(
    () => ({
      push: ({ search }: Location) =>
        router.push(
          { pathname: router.pathname, query: router.query },
          { search, pathname },
          { shallow: true }
        ),
      replace: ({ search }: Location) =>
        router.replace(
          { pathname: router.pathname, query: router.query },
          { search, pathname },
          { shallow: true }
        )
    }),
    [pathname, router.pathname, router.query, location.pathname]
    // [pathname, router]
  )

  return (
    <ContextProvider {...rest} history={history} location={location}>
      {children}
    </ContextProvider>
  )
}

export const QueryParamProvider = memo(QueryParamProviderComponent)
