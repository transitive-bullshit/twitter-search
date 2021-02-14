import { NextApiRequest, NextApiResponse } from 'next'

import { getIndex } from '../lib/server/sync'

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  console.log('getTweetIndex')

  if (req.method !== 'GET') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const index = await getIndex()
  const exists = await index.exists()

  res.status(200).json({
    indexName: index.indexName,
    exists
  })
}
