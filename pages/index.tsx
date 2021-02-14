import React from 'react'
import { App } from 'components'

export const getStaticProps = async () => {
  return {
    props: {},
    revalidate: 10
  }
}

export default function NotionDomainPage(props) {
  return <App {...props} />
}
