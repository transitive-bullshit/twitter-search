import React from 'react'
import isEqual from 'lodash.isequal'
import PropTypes from 'prop-types'
import twemoji from 'twemoji'

export default class Twemoji extends React.Component<any> {
  static propTypes = {
    children: PropTypes.node,
    noWrapper: PropTypes.bool,
    options: PropTypes.object,
    tag: PropTypes.string
  }

  static defaultProps = {
    tag: 'div'
  }

  childrenRefs: any
  rootRef: any

  constructor(props) {
    super(props)
    if (props.noWrapper) {
      this.childrenRefs = {}
    } else {
      this.rootRef = React.createRef()
    }
  }

  _parseTwemoji() {
    const { noWrapper } = this.props
    if (noWrapper) {
      for (const i in this.childrenRefs) {
        const node = this.childrenRefs[i].current
        twemoji.parse(node, this.props.options)
      }
    } else {
      const node = this.rootRef.current
      twemoji.parse(node, this.props.options)
    }
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props, prevProps)) {
      this._parseTwemoji()
    }
  }

  componentDidMount() {
    this._parseTwemoji()
  }

  render() {
    const { children, noWrapper, tag, ...other } = this.props
    if (noWrapper) {
      return (
        <>
          {React.Children.map(children, (c, i) => {
            if (typeof c === 'string') {
              return c
            }
            this.childrenRefs[i] = this.childrenRefs[i] || React.createRef()
            return React.cloneElement(c as any, { ref: this.childrenRefs[i] })
          })}
        </>
      )
    } else {
      delete (other as any).options
      return React.createElement(tag, { ref: this.rootRef, ...other }, children)
    }
  }
}
