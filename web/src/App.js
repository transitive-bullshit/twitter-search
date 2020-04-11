import React from 'react'

import {
  BrowserRouter as Router,
  Route,
  Switch,
  NavLink,
  withRouter
} from 'react-router-dom'
import { Breadcrumb, Spin } from 'antd'

import { sdk } from './lib/sdk'
import { JobsTable, JobLogsTable, Paper } from './components'

import styles from './styles/app.module.css'

const Layout = withRouter(({ location, children }) => {
  const pathSnippets = location.pathname.split('/').filter(Boolean)
  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`

    return (
      <Breadcrumb.Item key={url}>
        <NavLink to={url} activeClassName={styles.activeLink}>
          Job Logs
        </NavLink>
      </Breadcrumb.Item>
    )
  })

  const breadcrumbItems = [
    <Breadcrumb.Item key='home'>
      <NavLink to='/' activeClassName={styles.activeLink}>
        Home
      </NavLink>
    </Breadcrumb.Item>
  ].concat(extraBreadcrumbItems)

  return (
    <Paper className={styles.content}>
      <Breadcrumb className={styles.breadcrumb}>{breadcrumbItems}</Breadcrumb>

      {children}
    </Paper>
  )
})

export class App extends React.Component {
  state = {
    status: 'loading'
  }

  componentDidMount() {
    sdk.ready
      .then(() => {
        this.setState({ status: 'ready' })
      })
      .catch((err) => {
        console.error(err)
        this.setState({ status: 'error' })
      })
  }

  render() {
    const { status } = this.state

    return (
      <div className={styles.body}>
        {status === 'loading' && <Spin />}
        {status === 'error' && 'Error connecting to Saasify'}
        {status === 'ready' && (
          <Router>
            <Layout>
              <Switch>
                <Route
                  path='/'
                  exact
                  breadcrumbName='Home'
                  component={JobsTable}
                />

                <Route
                  path='/:jobId'
                  breadcrumbName=':jobId Job Logs'
                  component={JobLogsTable}
                />
              </Switch>
            </Layout>
          </Router>
        )}
      </div>
    )
  }
}
