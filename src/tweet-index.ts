import { Controller, Get, Put, Route, Header } from 'tsoa'

import { TweetIndex } from './types'
import * as sync from './sync'
import * as twitter from './twitter'

@Route('/')
export class TweetIndexController extends Controller {
  @Get()
  public async getTweetIndex(
    @Header('x-saasify-user') userId: string
  ): Promise<TweetIndex> {
    console.log('getTweetIndex', { userId })

    const index = await sync.getIndex(userId)
    const exists = await index.exists()

    return {
      indexName: index.indexName,
      exists
    }
  }

  @Put()
  public async syncTweetIndex(
    @Header('x-twitter-access-token') twitterAccessToken: string,
    @Header('x-twitter-access-token-secret') twitterAccessTokenSecret: string,
    @Header('x-saasify-user') userId: string,
    @Header('x-saasify-plan') plan: string
  ): Promise<TweetIndex> {
    console.log('syncTweetIndex', { userId })

    const index = await sync.getIndex(userId)

    const twitterClient = await twitter.getTwitterClient({
      accessToken: twitterAccessToken,
      accessTokenSecret: twitterAccessTokenSecret
    })

    await sync.syncAccount(twitterClient, index, plan, true)

    return {
      indexName: index.indexName,
      exists: true
    }
  }
}
