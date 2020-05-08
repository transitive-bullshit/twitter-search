import React, { useState, useEffect, useCallback } from 'react'
import processString from 'react-process-string'
import BlockImage from 'react-block-image'
import TweetEmbed from 'react-tweet-embed'
import cs from 'classnames'
import qs from 'qs'

import { Tooltip, Select } from '@chakra-ui/core'

import defaultAvatar from './default-avatar.png'
import Twemoji from './Twemoji'
import styles from './styles.module.css'

export function Tweet(props) {
  const { config = {}, className, onFocusTweet, ...rest } = props
  const [text, setText] = useState(config.text)

  useEffect(() => {
    setText(
      processString([
        {
          regex: /((http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)/g,
          fn: (key, result) => {
            return (
              <span key={key}>
                {' '}
                <a
                  className={cs(styles.link, styles.mention)}
                  target='_blank'
                  href={result[1]}
                >
                  {result[1]}
                </a>
              </span>
            )
          }
        },
        {
          regex: /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:(?:@|＠)(?!\/))([a-zA-Z0-9/_]{1,15})(?:\b(?!@|＠)|$)/,
          fn: (key, result) => {
            return (
              <span key={key}>
                {' '}
                <a
                  className={cs(styles.link, styles.mention)}
                  target='_blank'
                  href={`https://twitter.com/${result[1]}`}
                >
                  @{result[1]}
                </a>
              </span>
            )
          }
        },
        {
          regex: /(?:^|[^a-zA-Z0-9_＠!@#$%&*])(?:#(?!\/))([a-zA-Z0-9/_]{1,280})(?:\b(?!#)|$)/,
          fn: (key, result) => {
            return (
              <span key={key}>
                {' '}
                <a
                  className={cs(styles.link, styles.mention)}
                  target='_blank'
                  href={`https://twitter.com/search?${qs.stringify({
                    q: result[1]
                  })}`}
                >
                  #{result[1]}
                </a>
              </span>
            )
          }
        },
        {
          regex: /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/,
          fn: (key, result) => {
            return (
              <Twemoji
                key={key}
                options={{ className: styles['twemoji-bg'] }}
                style={{ display: 'inline' }}
              >
                {result[1]}
              </Twemoji>
            )
          }
        },
        {
          regex: /<ais-highlight-0000000000>([^<]*)<\/ais-highlight-0000000000>/gm,
          fn: (key, result) => {
            console.log({ key, result })
            return (
              <span key={key}>
                {' '}
                <b className={styles.highlight}>{result[1]}</b>
              </span>
            )
          }
        }
      ])(config.text.trim())
    )
  }, [config.text])

  const onClickTweet = useCallback(
    (event) => {
      event.stopPropagation()
      const url = `https://twitter.com/${config.user.nickname}/status/${config.id_str}`
      const win = window.open(url, '_blank')
      win.focus()
    },
    [config.user.nickname, config.id_str]
  )

  return (
    <div
      className={cs(styles.tweet, className)}
      onMouseEnter={() => onFocusTweet(config.id_str)}
      onMouseMove={() => onFocusTweet(config.id_str)}
      onMouseLeave={() => onFocusTweet(null)}
      onClick={onClickTweet}
      {...rest}
    >
      <div className={styles.lhs}>
        <Tooltip
          placement='top'
          hasArrow={true}
          label={
            <span>
              {config.user.name} (@{config.user.nickname})
            </span>
          }
        >
          <a
            href={`https://twitter.com/${config.user.nickname}`}
            target='_blank'
          >
            <BlockImage
              className={styles.avatar}
              src={config.user.avatar.replace('http://', 'https://')}
              fallback={defaultAvatar}
              alt={config.user.name}
            />
          </a>
        </Tooltip>
      </div>

      <div className={styles.main}>
        <div className={styles.body}>{text}</div>
      </div>
    </div>
  )
}
