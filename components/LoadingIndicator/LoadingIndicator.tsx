import React, { Component } from 'react'
import cs from 'classnames'
import { Spinner } from '@chakra-ui/core'

import styles from './styles.module.css'

export class LoadingIndicator extends Component<any> {
  render() {
    const { className, ...rest } = this.props

    return (
      <div className={cs(styles.loadingIndicator, className)} {...rest}>
        <Spinner />
      </div>
    )
  }
}
