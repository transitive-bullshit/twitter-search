import { Controller, Get, Put, Route } from 'tsoa'

import { TweetIndex } from './types'
import { twitterClient } from './twitter'
import * as sync from './sync'

@Route('/')
export class TweetIndexController extends Controller {
  @Get()
  public async getTweetIndex(): Promise<TweetIndex> {
    console.log('getTweetIndex')

    const index = await sync.getIndex()
    const exists = await index.exists()

    return {
      indexName: index.indexName,
      exists
    }
  }

  @Put()
  public async syncTweetIndex(): Promise<TweetIndex> {
    console.log('syncTweetIndex')

    const index = await sync.getIndex()
    await sync.syncAccount(twitterClient, index, true)

    return {
      indexName: index.indexName,
      exists: true
    }
  }
}
