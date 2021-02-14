import { NextApiRequest, NextApiResponse } from 'next'

import { twitterClient } from '../lib/server/twitter'
import { getIndex, syncAccount } from '../lib/server/sync'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  console.log('syncTweetIndex')

  if (req.method !== 'PUT') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const { full = false } = req.body

  const index = await getIndex()
  await syncAccount(twitterClient, index, full)

  res.status(200).json({
    indexName: index.indexName,
    exists: true
  })
}
