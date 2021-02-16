import { App } from 'components'

export const getStaticProps = async () => {
  return {
    props: {},
    revalidate: 10
  }
}

export default App
